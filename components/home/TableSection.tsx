// components/home/TableSection.tsx
'use client';

import { useState } from 'react';
import CustomTable from '@/CustomTable';
import { buildColumnsFromDefinition } from '@/CustomTable/CustomTableColumnsConfig';

type Dataset = 'contacts' | 'messages';

type TableSectionProps = {
  selectedDataset: Dataset;
  onDatasetChange: (dataset: Dataset) => void;
  data: any[];
  columns: any[];
  title: string;
  onCellEdit: (rowId: string, colId: string, newValue: string) => void;
  isHydrated: boolean;
};

export default function TableSection({
  selectedDataset,
  onDatasetChange,
  data,
  columns,
  title,
  onCellEdit,
  isHydrated,
}: TableSectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 -mt-4 relative z-10">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="text-center w-full">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-2">
              Hacé doble clic en las celdas para editar • Filtrá desde los encabezados
            </p>
          </div>

          {/* Botones de selección de dataset - Mobile First */}
          <div className="w-full overflow-x-auto">
            <div className="flex gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 min-w-min mx-auto w-fit">
              <button
                onClick={() => onDatasetChange('contacts')}
                className={`px-2 sm:px-4 py-2 rounded-md font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                  selectedDataset === 'contacts'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                📇 Contactos
              </button>
              <button
                onClick={() => onDatasetChange('messages')}
                className={`px-2 sm:px-4 py-2 rounded-md font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                  selectedDataset === 'messages'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                💬 Mensajes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CustomTable Container - Responsive - Aumentado para 30 filas */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden h-[800px] sm:h-[900px] lg:h-[1000px]">
        {isHydrated && (
          <CustomTable
            data={data}
            columnsDef={columns}
            pageSize={50}
            loading={false}
            showFiltersToolbar={true}
            containerHeight="100%"
            rowHeight={26}
            loadingText="Cargando datos..."
            noResultsText="No se encontraron resultados"
            onCellEdit={onCellEdit}
          />
        )}
      </div>

      {/* Características compactas */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-8 sm:mb-12">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow text-center">
          <div className="text-xl sm:text-2xl mb-1">🔍</div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Búsqueda Global</div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Filtrá todo el contenido</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow text-center">
          <div className="text-xl sm:text-2xl mb-1">✏️</div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Edición Inline</div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Doble clic para editar</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow text-center">
          <div className="text-xl sm:text-2xl mb-1">🎨</div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">13 Tipos</div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Badges, currency, rating...</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow text-center">
          <div className="text-xl sm:text-2xl mb-1">📊</div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Export Excel</div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Un clic para descargar</div>
        </div>
      </div>
    </div>
  );
}
