'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PromptConfig, MissionField } from '@/lib/whatsapp/types/promptConfig';
import CustomTable from '@/CustomTable';
import { buildColumnsFromDefinition } from '@/CustomTable/CustomTableColumnsConfig';

interface PromptEditorProps {
  config: PromptConfig | null;
  loading: boolean;
  onSave: (key: string, value: string | object) => Promise<void>;
  onReload: () => Promise<void>;
}

interface IgnoredContact {
  id: number;
  phone: string;
  reason: string | null;
  first_message: string | null;
  ignored_at: string;
  expires_at: string | null;
  is_expired: boolean;
}

type TabId = 'identity' | 'mission' | 'strategy' | 'trigger' | 'ignored' | 'rules';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'identity',
    label: 'Identidad',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'mission',
    label: 'Misión',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'strategy',
    label: 'Estrategia',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'trigger',
    label: 'Disparador',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'ignored',
    label: 'Ignorados',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    id: 'rules',
    label: 'Reglas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export function PromptEditor({ config, loading, onSave, onReload }: PromptEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('identity');
  const [saving, setSaving] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState<PromptConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
      setHasChanges(false);
    }
  }, [config]);

  const handleChange = useCallback((key: string, value: unknown) => {
    setLocalConfig(prev => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
    setHasChanges(true);
  }, []);

  const handleSave = async (key: string) => {
    if (!localConfig) return;
    setSaving(key);
    try {
      const value = localConfig[key as keyof PromptConfig];
      await onSave(key, value as string | object);
      setHasChanges(false);
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAll = async () => {
    if (!localConfig) return;
    setSaving('all');
    try {
      const editableKeys = [
        'assistant_name',
        'mission_fields',
        'conversation_strategy',
        'question_examples',
        'mission_complete_message',
        'extraction_rules',
        'base_identity',
        'unbreakable_rules',
        'trigger_criteria',
        'trigger_examples_positive',
        'trigger_examples_negative',
        'trigger_vip_phones',
        'trigger_context_instructions',
        'trigger_ignore_duration_hours',
      ];
      for (const key of editableKeys) {
        const value = localConfig[key as keyof PromptConfig];
        if (value !== undefined) {
          await onSave(key, value as string | object);
        }
      }
      setHasChanges(false);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!localConfig) {
    return (
      <div className="text-center py-12 text-gray-500">
        No se pudo cargar la configuración
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 px-2 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - SIN AnimatePresence para evitar problemas de estado */}
      <div className="flex-1 overflow-auto p-6">
        <div style={{ display: activeTab === 'identity' ? 'block' : 'none' }}>
          <IdentityTab
            config={localConfig}
            onChange={handleChange}
          />
        </div>
        <div style={{ display: activeTab === 'mission' ? 'block' : 'none' }}>
          <MissionTab
            config={localConfig}
            onChange={handleChange}
          />
        </div>
        <div style={{ display: activeTab === 'strategy' ? 'block' : 'none' }}>
          <StrategyTab
            config={localConfig}
            onChange={handleChange}
          />
        </div>
        <div style={{ display: activeTab === 'trigger' ? 'block' : 'none' }}>
          <TriggerTab
            config={localConfig}
            onChange={handleChange}
          />
        </div>
        <div style={{ display: activeTab === 'ignored' ? 'block' : 'none' }}>
          <IgnoredTab />
        </div>
        <div style={{ display: activeTab === 'rules' ? 'block' : 'none' }}>
          <RulesTab
            config={localConfig}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Cambios sin guardar
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onReload}
              disabled={saving !== null}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Recargar
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving !== null || !hasChanges}
              className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              {saving === 'all' && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Guardar y Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Identity Tab Component
function IdentityTab({
  config,
  onChange,
}: {
  config: PromptConfig;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Identidad del Asistente
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configurá cómo se presenta el asistente virtual a los clientes
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre del Asistente
          </label>
          <input
            type="text"
            value={config.assistant_name}
            onChange={(e) => onChange('assistant_name', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Ej: Ana, Carlos, Sofia..."
          />
          <p className="mt-2 text-xs text-gray-500">
            Este nombre se usará en todas las interacciones con los clientes
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Identidad Base
          </label>
          <textarea
            value={config.base_identity || ''}
            onChange={(e) => onChange('base_identity', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm resize-none"
            placeholder="Descripción de la identidad del asistente..."
          />
          <p className="mt-2 text-xs text-gray-500">
            Usá {'{assistant_name}'} para insertar el nombre del asistente dinámicamente
          </p>
        </div>
      </div>
    </div>
  );
}

// Mission Tab Component - Simplificado y robusto
function MissionTab({
  config,
  onChange,
}: {
  config: PromptConfig;
  onChange: (key: string, value: unknown) => void;
}) {
  const [availableFields, setAvailableFields] = useState<MissionField[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedField, setExpandedField] = useState<string | null>(null);

  // Cargar campos disponibles
  useEffect(() => {
    fetch('/api/crm-whatsapp/mission-fields')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setAvailableFields(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Helpers que siempre leen del config actual
  const getMissionFields = (): MissionField[] => {
    return Array.isArray(config.mission_fields) ? config.mission_fields : [];
  };

  const getQuestionExamples = (): Record<string, string[]> => {
    return config.question_examples && typeof config.question_examples === 'object'
      ? config.question_examples
      : {};
  };

  const getExtractionRules = (): Record<string, string> => {
    return config.extraction_rules && typeof config.extraction_rules === 'object'
      ? config.extraction_rules
      : {};
  };

  const isActive = (key: string): boolean => {
    return getMissionFields().some(f => f.key === key);
  };

  const getFieldConfig = (key: string): MissionField | undefined => {
    return getMissionFields().find(f => f.key === key);
  };

  // Toggle field
  const toggleField = (field: MissionField) => {
    const currentFields = getMissionFields();
    const currentExamples = getQuestionExamples();
    const currentRules = getExtractionRules();
    const fieldIsActive = currentFields.some(f => f.key === field.key);

    if (fieldIsActive) {
      // Desactivar
      const newFields = currentFields.filter(f => f.key !== field.key);
      onChange('mission_fields', newFields);

      const newExamples = { ...currentExamples };
      delete newExamples[field.key];
      onChange('question_examples', newExamples);

      const newRules = { ...currentRules };
      delete newRules[field.key];
      onChange('extraction_rules', newRules);

      if (expandedField === field.key) setExpandedField(null);
    } else {
      // Activar
      const newFields = [...currentFields, { ...field }];
      onChange('mission_fields', newFields);
      onChange('question_examples', { ...currentExamples, [field.key]: ['', ''] });
      onChange('extraction_rules', { ...currentRules, [field.key]: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-gray-500">Cargando campos...</span>
      </div>
    );
  }

  const activeCount = getMissionFields().length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Datos a Recopilar
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Activá los campos que el asistente debe obtener de cada cliente
        </p>
      </div>

      <div className="space-y-2">
        {availableFields.map((field) => {
          const active = isActive(field.key);
          const expanded = expandedField === field.key;
          const fieldConfig = getFieldConfig(field.key);
          const examples = getQuestionExamples();
          const rules = getExtractionRules();

          return (
            <div
              key={field.key}
              className={`rounded-xl border transition-all ${
                active
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleField(field)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${active ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {field.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {field.type === 'number' ? 'número' : field.type === 'enum' ? 'opciones' : 'texto'}
                    </span>
                  </div>
                  {field.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {field.description}
                    </p>
                  )}
                </div>

                {active && (
                  <button
                    type="button"
                    onClick={() => setExpandedField(expanded ? null : field.key)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      expanded
                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {expanded ? 'Cerrar' : 'Configurar'}
                  </button>
                )}
              </div>

              {active && expanded && fieldConfig && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={fieldConfig.description || ''}
                      onChange={(e) => {
                        const currentFields = getMissionFields();
                        const newFields = currentFields.map(f =>
                          f.key === field.key ? { ...f, description: e.target.value } : f
                        );
                        onChange('mission_fields', newFields);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Qué debe obtener la IA"
                    />
                  </div>

                  {fieldConfig.type === 'enum' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Opciones válidas (separar con coma)
                      </label>
                      <input
                        type="text"
                        value={(fieldConfig.values || []).join(', ')}
                        onChange={(e) => {
                          const values = e.target.value.split(',').map(v => v.trim().toUpperCase()).filter(Boolean);
                          const currentFields = getMissionFields();
                          const newFields = currentFields.map(f =>
                            f.key === field.key ? { ...f, values } : f
                          );
                          onChange('mission_fields', newFields);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="OPCIÓN1, OPCIÓN2, OPCIÓN3"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preguntas de ejemplo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1].map(i => (
                        <input
                          key={i}
                          type="text"
                          value={(examples[field.key] || ['', ''])[i] || ''}
                          onChange={(e) => {
                            const currentExamples = getQuestionExamples();
                            const fieldExamples = currentExamples[field.key] || ['', ''];
                            const newFieldExamples = [...fieldExamples];
                            newFieldExamples[i] = e.target.value;
                            onChange('question_examples', { ...currentExamples, [field.key]: newFieldExamples });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder={`Ejemplo ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Regla de extracción
                    </label>
                    <textarea
                      value={rules[field.key] || ''}
                      onChange={(e) => {
                        const currentRules = getExtractionRules();
                        onChange('extraction_rules', { ...currentRules, [field.key]: e.target.value });
                      }}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      placeholder="Cómo debe detectar este dato"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          {activeCount} {activeCount === 1 ? 'campo activo' : 'campos activos'}
        </div>
      )}

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Instrucciones al completar misión
        </label>
        <textarea
          value={config.mission_complete_message || ''}
          onChange={(e) => onChange('mission_complete_message', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          placeholder="Qué debe hacer el asistente cuando obtiene todos los datos"
        />
        <p className="mt-2 text-xs text-gray-500">
          Cada línea es una instrucción para cerrar la conversación
        </p>
      </div>
    </div>
  );
}

// Strategy Tab Component
function StrategyTab({
  config,
  onChange,
}: {
  config: PromptConfig;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Estrategia de Conversación
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Definí cómo debe interactuar el asistente con los clientes
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Instrucciones de Conversación
        </label>
        <textarea
          value={config.conversation_strategy}
          onChange={(e) => onChange('conversation_strategy', e.target.value)}
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm resize-none"
          placeholder="Escribí las instrucciones de cómo debe comportarse..."
        />
        <p className="mt-2 text-xs text-gray-500">
          Cada línea se presenta como una instrucción separada al asistente
        </p>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Consejos</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Usá instrucciones claras y directas</li>
              <li>• Evitá contradicciones entre instrucciones</li>
              <li>• Priorizá la naturalidad de la conversación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Trigger Tab Component
function TriggerTab({
  config,
  onChange,
}: {
  config: PromptConfig;
  onChange: (key: string, value: unknown) => void;
}) {
  const configRecord = config as Record<string, string>;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Disparador Inteligente
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          La IA analiza cada mensaje entrante y decide si iniciar la conversación basándose en estos criterios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Criterio Principal de Aceptación
            </label>
            <textarea
              value={configRecord.trigger_criteria || ''}
              onChange={(e) => onChange('trigger_criteria', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm"
              placeholder="Descripción de qué debe cumplir el mensaje para iniciar..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instrucciones de Contexto Adicionales
            </label>
            <textarea
              value={configRecord.trigger_context_instructions || ''}
              onChange={(e) => onChange('trigger_context_instructions', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm font-mono"
              placeholder="Instrucciones adicionales..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ejemplos Positivos (separar con |)
            </label>
            <textarea
              value={configRecord.trigger_examples_positive || ''}
              onChange={(e) => onChange('trigger_examples_positive', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm"
              placeholder="hola busco depto|quiero alquilar|..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ejemplos Negativos (separar con |)
            </label>
            <textarea
              value={configRecord.trigger_examples_negative || ''}
              onChange={(e) => onChange('trigger_examples_negative', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm"
              placeholder="spam|publicidad|..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Números VIP (separar con coma)
            </label>
            <input
              type="text"
              value={configRecord.trigger_vip_phones || ''}
              onChange={(e) => onChange('trigger_vip_phones', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              placeholder="5491112345678, 5491187654321"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duración de Ignorados (horas)
            </label>
            <input
              type="number"
              value={configRecord.trigger_ignore_duration_hours || '168'}
              onChange={(e) => onChange('trigger_ignore_duration_hours', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Definición de columnas para CustomTable de ignorados
const ignoredContactsColumns = buildColumnsFromDefinition({
  phone: { type: 'text', header: 'TELÉFONO', width: 150 },
  reason: { type: 'text', header: 'RAZÓN', width: 200 },
  first_message: { type: 'text', header: 'PRIMER MENSAJE', width: 250 },
  ignored_at: { type: 'date', header: 'IGNORADO', width: 140 },
  time_remaining: { type: 'badge', header: 'EXPIRA EN', width: 120 },
});

// Ignored Tab Component
function IgnoredTab() {
  const [contacts, setContacts] = useState<IgnoredContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crm-whatsapp/ignored-contacts');
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error cargando ignorados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return 'Permanente';
    const now = new Date();
    const expires = new Date(expiresAt);
    if (expires <= now) return 'Expirado';
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    return `${diffHours}h`;
  };

  const tableData = contacts.filter(c => !c.is_expired).map(contact => ({
    id: contact.id.toString(),
    phone: contact.phone,
    reason: contact.reason || '-',
    first_message: contact.first_message || '-',
    ignored_at: contact.ignored_at,
    time_remaining: getTimeRemaining(contact.expires_at),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Contactos Ignorados
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {stats.active} activos de {stats.total} total
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: '400px' }}>
        <CustomTable
          data={tableData}
          columnsDef={ignoredContactsColumns}
          pageSize={50}
          loading={loading}
          showFiltersToolbar={true}
          containerHeight="100%"
          rowHeight={28}
          onRefresh={fetchContacts}
        />
      </div>
    </div>
  );
}

// Rules Tab Component
function RulesTab({
  config,
  onChange,
}: {
  config: PromptConfig;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Reglas del Asistente
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Reglas que definen el comportamiento fundamental
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Reglas de Comportamiento
        </label>
        <textarea
          value={config.unbreakable_rules || ''}
          onChange={(e) => onChange('unbreakable_rules', e.target.value)}
          rows={12}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm resize-none"
          placeholder="Reglas que el asistente debe seguir siempre..."
        />
      </div>

      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Importante</h4>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Modificá estas reglas con cuidado. Afectan directamente cómo responde el asistente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
