// LICENSE: MIT
export const SELECTED_CELL_CLASS = 'selected-cell-rect';
export const COPIED_CELL_CLASS = 'copied-cell-rect';

export function applyCopiedEffect(element: HTMLElement | null, duration = 800) {
  if (!element) return;
  element.classList.add(COPIED_CELL_CLASS);
  setTimeout(() => element.classList.remove(COPIED_CELL_CLASS), duration);
}

export function applySelectedEffect(element: HTMLElement | null) {
  if (element) element.classList.add(SELECTED_CELL_CLASS);
}
export function removeSelectedEffect(element: HTMLElement | null) {
  if (element) element.classList.remove(SELECTED_CELL_CLASS);
}
