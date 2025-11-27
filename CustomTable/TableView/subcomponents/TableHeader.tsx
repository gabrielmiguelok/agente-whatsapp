'use client';

import React from 'react';
import { IconButton } from '@mui/material';
import { Filter } from 'lucide-react';
import { STYLES_CONFIG, COLORS_CONFIG } from '../../config';

export default function TableHeader({
  headerGroups,
  handleHeaderClick,
  onHeaderMouseDown,
  onHeaderTouchStart,
  handleOpenMenu,
  handleMouseDownResize,
}: {
  headerGroups: any[];
  handleHeaderClick: (evt: React.MouseEvent, index: number, colId: string) => void;
  onHeaderMouseDown: (evt: React.MouseEvent, index: number, colId: string) => void;
  onHeaderTouchStart: (evt: React.TouchEvent, index: number, colId: string) => void;
  handleOpenMenu: (evt: React.MouseEvent<HTMLElement>, colId: string) => void;
  handleMouseDownResize: (evt: React.MouseEvent, colId: string) => void;
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

              return (
                <th
                  key={header.id}
                  className="custom-th"
                  data-header-index={hIndex}
                  style={{
                    backgroundColor: isIndexCol
                      ? 'var(--color-table-index-header)'
                      : 'var(--color-table-header)',
                    cursor: 'pointer',
                  }}
                  onClick={(evt) => handleHeaderClick(evt, hIndex, colId)}
                  onMouseDown={(evt) => onHeaderMouseDown(evt, hIndex, colId)}
                  onTouchStart={(evt) => onHeaderTouchStart(evt, hIndex, colId)}
                >
                  <div className="column-header-content">
                    <span
                      className="column-header-label"
                      style={{
                        fontWeight: (isIndexCol ? STYLES_CONFIG.header.indexFontWeight : STYLES_CONFIG.header.fontWeight) as any,
                        color: COLORS_CONFIG.cssVars.text
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

                  {/* Manija de resize con feedback azul Synara sutil */}
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

      {/* Estilos locales alineados al brand Synara 2025 */}
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
        /* Feedback de hover: línea azul Synara sutil */
        th.custom-th:hover .resize-handle {
          background: ${STYLES_CONFIG.resizeHandle.hoverBackground};
        }
      `}</style>
    </>
  );
}
// LICENSE: MIT
