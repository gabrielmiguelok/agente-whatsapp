'use client';

import React from 'react';
import { IconButton } from '@mui/material';
import { Filter, GripVertical } from 'lucide-react';
import { STYLES_CONFIG, COLORS_CONFIG } from '../../config';

export default function TableHeader({
  headerGroups,
  handleHeaderClick,
  onHeaderMouseDown,
  onHeaderTouchStart,
  handleOpenMenu,
  handleMouseDownResize,
  draggedColumn,
  dropTargetColumn,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: {
  headerGroups: any[];
  handleHeaderClick: (evt: React.MouseEvent, index: number, colId: string) => void;
  onHeaderMouseDown: (evt: React.MouseEvent, index: number, colId: string) => void;
  onHeaderTouchStart: (evt: React.TouchEvent, index: number, colId: string) => void;
  handleOpenMenu: (evt: React.MouseEvent<HTMLElement>, colId: string) => void;
  handleMouseDownResize: (evt: React.MouseEvent, colId: string) => void;
  draggedColumn?: string | null;
  dropTargetColumn?: string | null;
  onDragStart?: (columnId: string) => void;
  onDragOver?: (columnId: string) => void;
  onDragEnd?: () => void;
  onDrop?: (targetColumnId: string) => void;
}) {
  return (
    <>
      <thead
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: COLORS_CONFIG.cssVars.bgPaper,
          boxShadow: STYLES_CONFIG.header.boxShadow,
        }}
      >
        {headerGroups.map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header: any, hIndex: number) => {
              const colId = header.column.id as string;
              const isIndexCol = colId === '_selectIndex';
              const isDragging = draggedColumn === colId;
              const isDropTarget = dropTargetColumn === colId && draggedColumn !== colId;

              return (
                <th
                  key={header.id}
                  className="custom-th"
                  data-header-index={hIndex}
                  draggable={false}
                  onDragOver={(e) => {
                    if (isIndexCol) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    onDragOver?.(colId);
                  }}
                  onDragEnd={() => {
                    onDragEnd?.();
                  }}
                  onDrop={(e) => {
                    if (isIndexCol) return;
                    e.preventDefault();
                    onDrop?.(colId);
                  }}
                  style={{
                    backgroundColor: isIndexCol
                      ? 'var(--color-table-index-header)'
                      : isDragging
                      ? 'rgba(18, 124, 243, 0.15)'
                      : isDropTarget
                      ? 'rgba(18, 124, 243, 0.25)'
                      : 'var(--color-table-header)',
                    cursor: isIndexCol ? 'pointer' : 'grab',
                    opacity: isDragging ? 0.6 : 1,
                    borderLeft: isDropTarget ? '3px solid #127CF3' : undefined,
                    transition: 'background-color 0.15s ease, opacity 0.15s ease',
                  }}
                  onClick={(evt) => handleHeaderClick(evt, hIndex, colId)}
                  onMouseDown={(evt) => onHeaderMouseDown(evt, hIndex, colId)}
                  onTouchStart={(evt) => onHeaderTouchStart(evt, hIndex, colId)}
                >
                  <div className="column-header-content">
                    {!isIndexCol && onDragStart && (
                      <span
                        className="drag-handle"
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', colId);
                          onDragStart(colId);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                          cursor: 'grab',
                          opacity: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          marginRight: '4px',
                          padding: '2px',
                          borderRadius: '2px',
                        }}
                      >
                        <GripVertical size={14} />
                      </span>
                    )}
                    <span
                      className="column-header-label"
                      style={{
                        fontWeight: (isIndexCol ? STYLES_CONFIG.header.indexFontWeight : STYLES_CONFIG.header.fontWeight) as any,
                        color: COLORS_CONFIG.cssVars.text,
                        flex: 1,
                      }}
                      title={String(header.column.columnDef.header || '')}
                    >
                      {header.isPlaceholder ? null : header.column.columnDef.header}
                    </span>

                    {!isIndexCol && (
                      <div className="column-header-actions">
                        <IconButton
                          size="small"
                          onClick={(evt) => {
                            evt.stopPropagation();
                            handleOpenMenu(evt, colId);
                          }}
                          sx={{
                            color: 'var(--color-text)',
                            p: '2px',
                            '&:hover': { color: 'var(--color-primary)' },
                          }}
                          aria-label="Abrir filtros de columna"
                          title="Filtros"
                        >
                          <Filter size={14} />
                        </IconButton>
                      </div>
                    )}
                  </div>

                  <div
                    className="resize-handle"
                    onMouseDown={(evt) => {
                      evt.stopPropagation();
                      handleMouseDownResize(evt, colId);
                    }}
                  />
                </th>
              );
            })}
          </tr>
        ))}
      </thead>

      <style jsx>{`
        th.custom-th {
          position: relative;
          white-space: ${STYLES_CONFIG.header.whiteSpace};
          overflow: ${STYLES_CONFIG.header.overflow};
          text-overflow: ${STYLES_CONFIG.header.textOverflow};
          user-select: none;
          color: ${COLORS_CONFIG.cssVars.text};
          border-bottom: 1px solid ${COLORS_CONFIG.cssVars.divider};
        }
        th.custom-th:active {
          cursor: grabbing;
        }
        .column-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: ${STYLES_CONFIG.header.gap};
          padding: ${STYLES_CONFIG.header.padding};
          background-image: linear-gradient(180deg, rgba(18,124,243,.06), rgba(18,124,243,0));
        }
        .column-header-label {
          font-size: ${STYLES_CONFIG.header.fontSize};
          letter-spacing: ${STYLES_CONFIG.header.letterSpacing};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .column-header-actions {
          display: flex;
          gap: 4px;
        }
        .drag-handle:hover {
          opacity: 1 !important;
          background: rgba(18, 124, 243, 0.15);
        }
        .drag-handle:active {
          cursor: grabbing;
        }
        .resize-handle {
          position: absolute;
          top: 0;
          right: ${STYLES_CONFIG.resizeHandle.rightOffset};
          width: ${STYLES_CONFIG.resizeHandle.width};
          height: ${STYLES_CONFIG.resizeHandle.height};
          cursor: col-resize;
          user-select: none;
          background: ${STYLES_CONFIG.resizeHandle.background};
        }
        th.custom-th:hover .resize-handle {
          background: ${STYLES_CONFIG.resizeHandle.hoverBackground};
        }
      `}</style>
    </>
  );
}
