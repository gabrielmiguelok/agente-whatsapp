"use client"

import type React from "react"

/************************************************************************************
 * LICENSE: MIT
 * Selección tipo Excel (mouse/touch + flechas con Shift/Ctrl). Firma pública intacta.
 ************************************************************************************/
import { useState, useEffect, useRef, useCallback } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"

type Coord = { rowIndex: number; colIndex: number }
type CellRef = { id: string; colField: string }
type Box = { x: number; y: number; width: number; height: number }
type Options = { onSelectionChange?: (cells: CellRef[]) => void }

export default function useCellSelection(
  containerRef: React.RefObject<HTMLElement>,
  getCellsInfo: () => { id: string; colField: string; x: number; y: number; width: number; height: number }[],
  _data: any[],
  _columnsDef: any[],
  table: TanStackTable<any>,
  options: Options = {},
) {
  const [selectionBox, setSelectionBox] = useState<Box | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedCells, setSelectedCells] = useState<CellRef[]>([])
  const [anchorCell, setAnchorCell] = useState<Coord | null>(null)
  const [focusCell, setFocusCell] = useState<Coord | null>(null)

  const startPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  const rafIdRef = useRef<number | null>(null)
  const autoScrollRafRef = useRef<number | null>(null)
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const rows = table?.getRowModel()?.rows || []
  const colCount = table?.getVisibleFlatColumns()?.length || 0

  const EDGE_SCROLL_THRESHOLD = 50
  const SCROLL_SPEED = 20
  const OUTSIDE_SCROLL_MULTIPLIER = 2

  const { onSelectionChange } = options

  const isEmpty = (val: any) => val === null || val === undefined || val === ""

  const areSelectionsEqual = (arrA: CellRef[], arrB: CellRef[]) => {
    if (arrA.length !== arrB.length) return false
    const a = [...arrA].sort((x, y) => (x.id + x.colField).localeCompare(y.id + y.colField))
    const b = [...arrB].sort((x, y) => (x.id + x.colField).localeCompare(y.id + y.colField))
    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id || a[i].colField !== b[i].colField) return false
    }
    return true
  }

  const rectsIntersect = useCallback((r1: Box, cell: { x: number; y: number; width: number; height: number }) => {
    const r2 = { x: cell.x, y: cell.y, width: cell.width, height: cell.height }
    return !(r2.x > r1.x + r1.width || r2.x + r2.width < r1.x || r2.y > r1.y + r1.height || r2.y + r2.height < r1.y)
  }, [])

  const getCellValue = useCallback(
    (rowIndex: number, colIndex: number) => {
      const rowObj = rows[rowIndex]
      const colObj = table.getVisibleFlatColumns()[colIndex]
      return rowObj?.original?.[colObj?.id]
    },
    [rows, table],
  )

  const getCellsInRange = useCallback(
    (start: Coord, end: Coord) => {
      const rowStart = Math.min(start.rowIndex, end.rowIndex)
      const rowEnd = Math.max(start.rowIndex, end.rowIndex)
      const colStart = Math.min(start.colIndex, end.colIndex)
      const colEnd = Math.max(start.colIndex, end.colIndex)

      const out: CellRef[] = []
      for (let r = rowStart; r <= rowEnd; r++) {
        const rowId = rows[r]?.id
        if (rowId == null) continue
        for (let c = colStart; c <= colEnd; c++) {
          const colId = table.getVisibleFlatColumns()[c]?.id
          if (!colId) continue
          out.push({ id: String(rowId), colField: colId })
        }
      }
      return out
    },
    [rows, table],
  )

  const findLastCellInDirection = useCallback(
    (current: Coord, direction: string, ctrlPressed: boolean, shiftPressed: boolean) => {
      if (!ctrlPressed) return current

      const { rowIndex, colIndex } = current
      const startEmpty = isEmpty(getCellValue(rowIndex, colIndex))
      const maxRow = rows.length - 1
      const maxCol = colCount - 1

      let dr = 0,
        dc = 0
      if (direction === "ArrowUp") dr = -1
      if (direction === "ArrowDown") dr = 1
      if (direction === "ArrowLeft") dc = -1
      if (direction === "ArrowRight") dc = 1

      let newRow = rowIndex
      let newCol = colIndex
      let foundJump = false

      while (true) {
        const nextRow = newRow + dr
        const nextCol = newCol + dc
        if (nextRow < 0 || nextRow > maxRow || nextCol < 0 || nextCol > maxCol) break

        const cellEmpty = isEmpty(getCellValue(nextRow, nextCol))

        if (startEmpty) {
          if (!cellEmpty) {
            newRow = nextRow
            newCol = nextCol
            foundJump = true
            break
          } else {
            newRow = nextRow
            newCol = nextCol
            foundJump = true
          }
        } else {
          if (cellEmpty) break
          newRow = nextRow
          newCol = nextCol
          foundJump = true
        }
      }

      if (!foundJump) {
        const sr = rowIndex + dr,
          sc = colIndex + dc
        if (sr >= 0 && sr <= maxRow && sc >= 0 && sc <= maxCol) {
          newRow = sr
          newCol = sc
        }
      } else if (shiftPressed) {
        const er = newRow + dr,
          ec = newCol + dc
        if (er >= 0 && er <= maxRow && ec >= 0 && ec <= maxCol) {
          newRow = er
          newCol = ec
        }
      }

      return { rowIndex: newRow, colIndex: newCol }
    },
    [colCount, getCellValue, rows],
  )

  const findScrollableContainer = useCallback((element: HTMLElement | null): HTMLElement | null => {
    if (!element) return null

    const tvScroll = element.closest(".tv-scroll") as HTMLElement
    if (tvScroll) return tvScroll

    let current = element.parentElement
    while (current) {
      const style = window.getComputedStyle(current)
      const overflowY = style.overflowY
      const overflowX = style.overflowX

      if (overflowY === "auto" || overflowY === "scroll" || overflowX === "auto" || overflowX === "scroll") {
        return current
      }

      current = current.parentElement
    }

    return null
  }, [])

  const detectClickedCell = useCallback(
    (clientX: number, clientY: number): Coord | null => {
      const container = containerRef.current
      if (!container) return null
      const cells = container.querySelectorAll("[data-rowindex][data-colindex]")
      for (const el of Array.from(cells)) {
        const rect = (el as HTMLElement).getBoundingClientRect()
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          const r = Number.parseInt((el as HTMLElement).getAttribute("data-rowindex") || "", 10)
          const c = Number.parseInt((el as HTMLElement).getAttribute("data-colindex") || "", 10)
          if (!Number.isNaN(r) && !Number.isNaN(c)) return { rowIndex: r, colIndex: c }
        }
      }
      return null
    },
    [containerRef],
  )

  const updateSelection = useCallback(
    (newSelected: CellRef[]) => {
      setSelectedCells((prev) => {
        if (!areSelectionsEqual(prev, newSelected)) onSelectionChange?.(newSelected)
        return newSelected
      })
    },
    [onSelectionChange],
  )

  const autoScrollIfNeeded = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current
      if (!container) return { scrolledX: false, scrolledY: false }

      const scrollContainer = findScrollableContainer(container)
      if (!scrollContainer) return { scrolledX: false, scrolledY: false }

      const rect = scrollContainer.getBoundingClientRect()

      const offsetTop = clientY - rect.top
      const offsetBottom = rect.bottom - clientY
      const offsetLeft = clientX - rect.left
      const offsetRight = rect.right - clientX

      let scrolledX = false
      let scrolledY = false

      const isOutsideVertical = clientY < rect.top || clientY > rect.bottom
      const isOutsideHorizontal = clientX < rect.left || clientX > rect.right

      if (offsetTop < EDGE_SCROLL_THRESHOLD || clientY < rect.top) {
        const intensity = isOutsideVertical
          ? OUTSIDE_SCROLL_MULTIPLIER
          : Math.max(1, (EDGE_SCROLL_THRESHOLD - offsetTop) / EDGE_SCROLL_THRESHOLD)
        scrollContainer.scrollTop -= SCROLL_SPEED * intensity
        scrolledY = true
      }
      if (offsetBottom < EDGE_SCROLL_THRESHOLD || clientY > rect.bottom) {
        const intensity = isOutsideVertical
          ? OUTSIDE_SCROLL_MULTIPLIER
          : Math.max(1, (EDGE_SCROLL_THRESHOLD - offsetBottom) / EDGE_SCROLL_THRESHOLD)
        scrollContainer.scrollTop += SCROLL_SPEED * intensity
        scrolledY = true
      }

      if (offsetLeft < EDGE_SCROLL_THRESHOLD || clientX < rect.left) {
        const intensity = isOutsideHorizontal
          ? OUTSIDE_SCROLL_MULTIPLIER
          : Math.max(1, (EDGE_SCROLL_THRESHOLD - offsetLeft) / EDGE_SCROLL_THRESHOLD)
        scrollContainer.scrollLeft -= SCROLL_SPEED * intensity
        scrolledX = true
      }
      if (offsetRight < EDGE_SCROLL_THRESHOLD || clientX > rect.right) {
        const intensity = isOutsideHorizontal
          ? OUTSIDE_SCROLL_MULTIPLIER
          : Math.max(1, (EDGE_SCROLL_THRESHOLD - offsetRight) / EDGE_SCROLL_THRESHOLD)
        scrollContainer.scrollLeft += SCROLL_SPEED * intensity
        scrolledX = true
      }

      return { scrolledX, scrolledY }
    },
    [containerRef, findScrollableContainer],
  )

  const startContinuousAutoScroll = useCallback(() => {
    const loop = () => {
      if (!isSelecting || !draggingRef.current) {
        if (autoScrollRafRef.current) {
          cancelAnimationFrame(autoScrollRafRef.current)
          autoScrollRafRef.current = null
        }
        return
      }

      const { x, y } = lastMousePosRef.current
      const { scrolledX, scrolledY } = autoScrollIfNeeded(x, y)

      if (scrolledX || scrolledY) {
        const { x: startX, y: startY } = startPointRef.current
        const box: Box = {
          x: Math.min(startX, x),
          y: Math.min(startY, y),
          width: Math.abs(x - startX),
          height: Math.abs(y - startY),
        }
        setSelectionBox(box)

        const allCells = getCellsInfo()
        updateSelection(allCells.filter((cell) => rectsIntersect(box, cell)))
      }

      autoScrollRafRef.current = requestAnimationFrame(loop)
    }

    if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current)
    autoScrollRafRef.current = requestAnimationFrame(loop)
  }, [isSelecting, autoScrollIfNeeded, getCellsInfo, rectsIntersect, updateSelection])

  const stopContinuousAutoScroll = useCallback(() => {
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current)
      autoScrollRafRef.current = null
    }
  }, [])

  const handleSingleClickSelection = useCallback(
    (clickedCellPos: Coord) => {
      draggingRef.current = true
      setIsSelecting(true)
      document.body.style.userSelect = "none"

      setAnchorCell(clickedCellPos)
      setFocusCell(clickedCellPos)

      const rowId = rows[clickedCellPos.rowIndex]?.id
      const colField = table.getVisibleFlatColumns()[clickedCellPos.colIndex]?.id

      const already = selectedCells.some((c) => c.id === String(rowId) && c.colField === colField)
      if (!already && rowId != null && colField) updateSelection([{ id: String(rowId), colField }])

      startContinuousAutoScroll()
    },
    [rows, selectedCells, table, updateSelection, startContinuousAutoScroll],
  )

  const handleMouseMoveRaf = useCallback(
    (e: MouseEvent) => {
      const { x: startX, y: startY } = startPointRef.current
      const currentX = e.clientX
      const currentY = e.clientY

      lastMousePosRef.current = { x: currentX, y: currentY }

      autoScrollIfNeeded(currentX, currentY)

      const box: Box = {
        x: Math.min(startX, currentX),
        y: Math.min(startY, currentY),
        width: Math.abs(currentX - startX),
        height: Math.abs(currentY - startY),
      }
      setSelectionBox(box)

      const allCells = getCellsInfo()
      updateSelection(allCells.filter((cell) => rectsIntersect(box, cell)))
    },
    [autoScrollIfNeeded, getCellsInfo, rectsIntersect, updateSelection],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isSelecting && (e.buttons & 1) !== 1) {
        draggingRef.current = false
        setIsSelecting(false)
        setSelectionBox(null)
        document.body.style.userSelect = ""
        return
      }
      if (!isSelecting || !draggingRef.current) return
      e.preventDefault()
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = requestAnimationFrame(() => handleMouseMoveRaf(e))
    },
    [handleMouseMoveRaf, isSelecting],
  )

  const finishDrag = useCallback(() => {
    if (isSelecting && selectionBox) {
      const allCells = getCellsInfo()
      updateSelection(allCells.filter((cell) => rectsIntersect(selectionBox, cell)))
    }
    setIsSelecting(false)
    draggingRef.current = false
    startPointRef.current = { x: 0, y: 0 }
    setSelectionBox(null)
    document.body.style.userSelect = ""

    stopContinuousAutoScroll()
  }, [isSelecting, selectionBox, getCellsInfo, rectsIntersect, updateSelection, stopContinuousAutoScroll])

  const handleMouseUp = finishDrag

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return
      if (e.touches.length !== 1) return

      const t = e.touches[0]
      startPointRef.current = { x: t.clientX, y: t.clientY }
      draggingRef.current = false

      const pos = detectClickedCell(t.clientX, t.clientY)
      if (pos) {
        draggingRef.current = true
        setIsSelecting(true)
        document.body.style.userSelect = "none"

        setAnchorCell(pos)
        setFocusCell(pos)

        const rowId = rows[pos.rowIndex]?.id
        const colField = table.getVisibleFlatColumns()[pos.colIndex]?.id
        if (rowId != null && colField) updateSelection([{ id: String(rowId), colField }])

        lastMousePosRef.current = { x: t.clientX, y: t.clientY }
        startContinuousAutoScroll()
      }
    },
    [containerRef, detectClickedCell, rows, table, updateSelection, startContinuousAutoScroll],
  )

  const handleTouchMoveRaf = useCallback(
    (touch: Touch) => {
      const { x: startX, y: startY } = startPointRef.current
      const currentX = touch.clientX
      const currentY = touch.clientY

      lastMousePosRef.current = { x: currentX, y: currentY }

      autoScrollIfNeeded(currentX, currentY)

      const box: Box = {
        x: Math.min(startX, currentX),
        y: Math.min(startY, currentY),
        width: Math.abs(currentX - startX),
        height: Math.abs(currentY - startY),
      }
      setSelectionBox(box)

      const allCells = getCellsInfo()
      updateSelection(allCells.filter((cell) => rectsIntersect(box, cell)))
    },
    [autoScrollIfNeeded, getCellsInfo, rectsIntersect, updateSelection],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      if (isSelecting && !draggingRef.current) {
        setIsSelecting(false)
        setSelectionBox(null)
        document.body.style.userSelect = ""
        return
      }
      if (!isSelecting || !draggingRef.current) return
      e.preventDefault()

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = requestAnimationFrame(() => handleTouchMoveRaf(e.touches[0]))
    },
    [handleTouchMoveRaf, isSelecting],
  )

  const handleTouchEnd = finishDrag

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button !== 0) return
      if (!containerRef.current?.contains(e.target as Node)) return
      startPointRef.current = { x: e.clientX, y: e.clientY }
      draggingRef.current = false

      if (!(e.shiftKey || e.ctrlKey || (e as any).metaKey)) {
        const pos = detectClickedCell(e.clientX, e.clientY)
        if (pos) handleSingleClickSelection(pos)
      }
    },
    [containerRef, detectClickedCell, handleSingleClickSelection],
  )

  const handleKeyDownArrowSelection = useCallback(
    (e: KeyboardEvent) => {
      if (!focusCell) return

      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      let tempAnchor = anchorCell
      if (shift && !tempAnchor) tempAnchor = { ...focusCell }

      let newFocus = { ...focusCell }
      if (ctrl) {
        newFocus = findLastCellInDirection(newFocus, e.key, true, shift)
      } else {
        const maxRow = rows.length - 1
        const maxCol = colCount - 1
        if (e.key === "ArrowUp") newFocus.rowIndex = Math.max(0, newFocus.rowIndex - 1)
        else if (e.key === "ArrowDown") newFocus.rowIndex = Math.min(maxRow, newFocus.rowIndex + 1)
        else if (e.key === "ArrowLeft") newFocus.colIndex = Math.max(0, newFocus.colIndex - 1)
        else if (e.key === "ArrowRight") newFocus.colIndex = Math.min(maxCol, newFocus.colIndex + 1)
      }

      const rowId = rows[newFocus.rowIndex]?.id
      const colField = table.getVisibleFlatColumns()[newFocus.colIndex]?.id

      setFocusCell(newFocus)

      if (shift && tempAnchor) {
        const newCells = getCellsInRange(tempAnchor, newFocus)
        setSelectedCells((prev) => {
          if (!areSelectionsEqual(prev, newCells)) onSelectionChange?.(newCells)
          return newCells
        })
      } else {
        if (rowId != null && colField) {
          const single = [{ id: String(rowId), colField }]
          setSelectedCells((prev) => {
            if (!areSelectionsEqual(prev, single)) onSelectionChange?.(single)
            return single
          })
        }
        tempAnchor = newFocus
      }

      setAnchorCell(tempAnchor)

      const container = containerRef.current
      const el = container?.querySelector(
        `[data-rowindex="${newFocus.rowIndex}"][data-colindex="${newFocus.colIndex}"]`,
      ) as HTMLElement | null

      if (el && container) {
        const scrollContainer = findScrollableContainer(container)
        if (!scrollContainer) return

        const containerRect = scrollContainer.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()

        const SCROLL_MARGIN = 60

        if (elRect.left < containerRect.left + SCROLL_MARGIN) {
          const scrollAmount = containerRect.left + SCROLL_MARGIN - elRect.left
          scrollContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" })
        } else if (elRect.right > containerRect.right - SCROLL_MARGIN) {
          const scrollAmount = elRect.right - containerRect.right + SCROLL_MARGIN
          scrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" })
        }

        if (elRect.top < containerRect.top + SCROLL_MARGIN) {
          const scrollAmount = containerRect.top + SCROLL_MARGIN - elRect.top
          scrollContainer.scrollBy({ top: -scrollAmount, behavior: "smooth" })
        } else if (elRect.bottom > containerRect.bottom - SCROLL_MARGIN) {
          const scrollAmount = elRect.bottom - containerRect.bottom + SCROLL_MARGIN
          scrollContainer.scrollBy({ top: scrollAmount, behavior: "smooth" })
        }
      }

      e.preventDefault()
    },
    [
      anchorCell,
      colCount,
      containerRef,
      focusCell,
      findLastCellInDirection,
      findScrollableContainer,
      getCellsInRange,
      onSelectionChange,
      rows,
      table,
    ],
  )

  const validateCurrentSelection = useCallback(() => {
    if (!rows.length && selectedCells.length) {
      setSelectedCells([])
      setAnchorCell(null)
      setFocusCell(null)
      return
    }
    const rowIdSet = new Set(rows.map((r) => String(r.id)))
    const colIdSet = new Set(table.getVisibleFlatColumns().map((c) => c.id))
    const invalid = selectedCells.filter((cell) => !rowIdSet.has(cell.id) || !colIdSet.has(cell.colField))
    if (invalid.length) {
      setSelectedCells([])
      setAnchorCell(null)
      setFocusCell(null)
    }
  }, [rows, table, selectedCells])

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown, { passive: false })
    document.addEventListener("mousemove", handleMouseMove, { passive: false })
    document.addEventListener("mouseup", handleMouseUp as any, { passive: false })

    document.addEventListener("touchstart", handleTouchStart as any, { passive: false })
    document.addEventListener("touchmove", handleTouchMove as any, { passive: false })
    document.addEventListener("touchend", handleTouchEnd as any, { passive: false })
    document.addEventListener("touchcancel", handleTouchEnd as any, { passive: false })

    return () => {
      document.removeEventListener("mousedown", handleMouseDown as any)
      document.removeEventListener("mousemove", handleMouseMove as any)
      document.removeEventListener("mouseup", handleMouseUp as any)

      document.removeEventListener("touchstart", handleTouchStart as any)
      document.removeEventListener("touchmove", handleTouchMove as any)
      document.removeEventListener("touchend", handleTouchEnd as any)
      document.removeEventListener("touchcancel", handleTouchEnd as any)

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current)
      document.body.style.userSelect = ""
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    selectionBox,
    selectedCells,
    setSelectedCells,
    anchorCell,
    focusCell,
    setAnchorCell,
    setFocusCell,
    handleKeyDownArrowSelection,
  }
}
