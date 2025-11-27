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

  const handleChange = (key: string, value: unknown) => {
    if (!localConfig) return;
    setLocalConfig({ ...localConfig, [key]: value });
    setHasChanges(true);
  };

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
        // Identity and rules
        'base_identity',
        'unbreakable_rules',
        // Trigger keys
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
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'identity' && (
              <IdentityTab
                config={localConfig}
                onChange={handleChange}
                onSave={handleSave}
                saving={saving}
              />
            )}
            {activeTab === 'mission' && (
              <MissionTab
                config={localConfig}
                onChange={handleChange}
                onSave={handleSave}
                saving={saving}
              />
            )}
            {activeTab === 'strategy' && (
              <StrategyTab
                config={localConfig}
                onChange={handleChange}
                onSave={handleSave}
                saving={saving}
              />
            )}
            {activeTab === 'trigger' && (
              <TriggerTab
                config={localConfig}
                onChange={handleChange}
                onSave={handleSave}
                saving={saving}
              />
            )}
            {activeTab === 'ignored' && (
              <IgnoredTab />
            )}
            {activeTab === 'rules' && (
              <RulesTab
                config={localConfig}
                onChange={handleChange}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Cambios sin guardar
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReload}
              disabled={saving !== null}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Recargar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveAll}
              disabled={saving !== null || !hasChanges}
              className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              {saving === 'all' && (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              )}
              Guardar y Aplicar
            </motion.button>
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
  onSave,
  saving,
}: {
  config: PromptConfig;
  onChange: (key: string, value: unknown) => void;
  onSave: (key: string) => void;
  saving: string | null;
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

// Mission Tab Component
function MissionTab({
  config,
  onChange,
  onSave,
  saving,
}: {
  config: PromptConfig;
  onChange: (key: string, value: unknown) => void;
  onSave: (key: string) => void;
  saving: string | null;
}) {
  const updateField = (index: number, updates: Partial<MissionField>) => {
    const newFields = [...config.mission_fields];
    newFields[index] = { ...newFields[index], ...updates };
    onChange('mission_fields', newFields);
  };

  const updateQuestionExample = (fieldKey: string, index: number, value: string) => {
    const newExamples = { ...config.question_examples };
    if (!newExamples[fieldKey]) newExamples[fieldKey] = [];
    newExamples[fieldKey][index] = value;
    onChange('question_examples', newExamples);
  };

  const updateExtractionRule = (fieldKey: string, value: string) => {
    const newRules = { ...config.extraction_rules };
    newRules[fieldKey] = value;
    onChange('extraction_rules', newRules);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Campos a Obtener
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configurá qué información debe recopilar el asistente de cada cliente
        </p>
      </div>

      <div className="space-y-4">
        {config.mission_fields.map((field, index) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{field.label}</h4>
                  <p className="text-xs text-gray-500">Campo: {field.dbColumn}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                field.type === 'number' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                field.type === 'enum' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>
                {field.type === 'number' ? 'Numérico' : field.type === 'enum' ? 'Opciones' : 'Texto'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Descripción
                </label>
                <input
                  type="text"
                  value={field.description}
                  onChange={(e) => updateField(index, { description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Preguntas de Ejemplo
                </label>
                <div className="space-y-2">
                  {(config.question_examples[field.key] || ['', '']).slice(0, 2).map((example, i) => (
                    <input
                      key={i}
                      type="text"
                      value={example}
                      onChange={(e) => updateQuestionExample(field.key, i, e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder={`Ejemplo ${i + 1}...`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Regla de Extracción
                </label>
                <textarea
                  value={config.extraction_rules[field.key] || ''}
                  onChange={(e) => updateExtractionRule(field.key, e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder="Cómo debe detectar y extraer este dato..."
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mensaje al Completar Misión
        </label>
        <textarea
          value={config.mission_complete_message}
          onChange={(e) => onChange('mission_complete_message', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          placeholder="Instrucciones cuando se obtienen todos los datos..."
        />
        <p className="mt-2 text-xs text-gray-500">
          Cada línea se convierte en una instrucción para el asistente
        </p>
      </div>
    </div>
  );
}

// Strategy Tab Component
function StrategyTab({
  config,
  onChange,
  onSave,
  saving,
}: {
  config: PromptConfig;
  onChange: (key: string, value: unknown) => void;
  onSave: (key: string) => void;
  saving: string | null;
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
  onSave,
  saving,
}: {
  config: PromptConfig;
  onChange: (key: string, value: unknown) => void;
  onSave: (key: string) => void;
  saving: string | null;
}) {
  const [ignoredContacts, setIgnoredContacts] = useState<IgnoredContact[]>([]);
  const [loadingIgnored, setLoadingIgnored] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });

  const configRecord = config as Record<string, string>;

  const fetchIgnoredContacts = useCallback(async () => {
    setLoadingIgnored(true);
    try {
      const response = await fetch('/api/crm-whatsapp/ignored-contacts');
      const data = await response.json();
      if (data.success) {
        setIgnoredContacts(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error cargando ignorados:', error);
    } finally {
      setLoadingIgnored(false);
    }
  }, []);

  const handleRemoveIgnored = async (phone: string) => {
    try {
      await fetch(`/api/crm-whatsapp/ignored-contacts?phone=${phone}`, { method: 'DELETE' });
      await fetchIgnoredContacts();
    } catch (error) {
      console.error('Error removiendo:', error);
    }
  };

  const handleCleanupExpired = async () => {
    try {
      await fetch('/api/crm-whatsapp/ignored-contacts', { method: 'PUT' });
      await fetchIgnoredContacts();
    } catch (error) {
      console.error('Error limpiando:', error);
    }
  };

  useEffect(() => {
    fetchIgnoredContacts();
  }, [fetchIgnoredContacts]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Disparador Inteligente
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          La IA analiza cada mensaje entrante y decide si iniciar la conversación basándose en estos criterios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Criterio Principal */}
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
            <p className="mt-1 text-xs text-gray-500">
              La IA usará este criterio para decidir si el mensaje justifica una respuesta
            </p>
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
              placeholder="Instrucciones adicionales sobre números, horarios, etc..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Acá podés indicar reglas especiales basadas en número, hora o día
            </p>
          </div>
        </div>

        {/* Ejemplos y VIP */}
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
              placeholder="spam|publicidad|vendo seguros|..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Números VIP (siempre inician, separar con coma)
            </label>
            <input
              type="text"
              value={configRecord.trigger_vip_phones || ''}
              onChange={(e) => onChange('trigger_vip_phones', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              placeholder="5491112345678, 5491187654321"
            />
            <p className="mt-1 text-xs text-gray-500">
              Estos números siempre inician conversación sin consultar a la IA
            </p>
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
              placeholder="168"
            />
            <p className="mt-1 text-xs text-gray-500">
              Cuántas horas permanecen ignorados (168 = 7 días)
            </p>
          </div>
        </div>
      </div>

      {/* Contactos Ignorados */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Contactos Ignorados
            </h4>
            <p className="text-sm text-gray-500">
              {stats.active} activos, {stats.expired} expirados de {stats.total} total
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCleanupExpired}
              className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              Limpiar expirados
            </button>
            <button
              onClick={fetchIgnoredContacts}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>

        {loadingIgnored ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : ignoredContacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay contactos ignorados
          </div>
        ) : (
          <div className="max-h-64 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Teléfono</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Razón</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Fecha</th>
                  <th className="text-center px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {ignoredContacts.filter(c => !c.is_expired).map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2 font-mono text-gray-900 dark:text-white">{contact.phone}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400 truncate max-w-xs" title={contact.reason || ''}>
                      {contact.reason || '-'}
                    </td>
                    <td className="px-4 py-2 text-gray-500 dark:text-gray-500">
                      {new Date(contact.ignored_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleRemoveIgnored(contact.phone)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        title="Remover de ignorados"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div>
            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Cómo funciona</h4>
            <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
              <li>• La IA recibe el mensaje + teléfono + hora + día para decidir</li>
              <li>• Los números VIP siempre inician (si no están ignorados)</li>
              <li>• Si decide NO iniciar, el contacto se agrega a ignorados</li>
              <li>• Los ignorados no consultan a la IA hasta que expiran</li>
            </ul>
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

// Ignored Tab Component - Gestión dedicada de contactos ignorados
function IgnoredTab() {
  const [contacts, setContacts] = useState<IgnoredContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
  const [clearingAll, setClearingAll] = useState(false);
  const [clearingExpired, setClearingExpired] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  // Estados para agregar nuevo contacto
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newHours, setNewHours] = useState('168');
  const [addingContact, setAddingContact] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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

  const handleAddContact = async () => {
    if (!newPhone.trim()) {
      setAddError('El teléfono es requerido');
      return;
    }

    // Validar formato de teléfono (solo números, mínimo 10 dígitos)
    const cleanPhone = newPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setAddError('El teléfono debe tener al menos 10 dígitos');
      return;
    }

    setAddingContact(true);
    setAddError(null);

    try {
      const response = await fetch('/api/crm-whatsapp/ignored-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          reason: newReason || 'Agregado manualmente',
          hours: parseInt(newHours) || 168,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewPhone('');
        setNewReason('');
        setNewHours('168');
        setShowAddForm(false);
        await fetchContacts();
      } else {
        setAddError(data.error || 'Error agregando contacto');
      }
    } catch (error) {
      setAddError('Error de conexión');
    } finally {
      setAddingContact(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    const contact = contacts.find(c => c.id.toString() === id);
    if (!contact || !confirm(`¿Eliminar ${contact.phone} de la lista de ignorados?`)) return;

    try {
      await fetch(`/api/crm-whatsapp/ignored-contacts?id=${id}`, { method: 'DELETE' });
      await fetchContacts();
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  const handleClearExpired = async () => {
    if (!confirm('¿Limpiar todos los contactos expirados?')) return;
    setClearingExpired(true);
    try {
      await fetch('/api/crm-whatsapp/ignored-contacts?action=expired', { method: 'PUT' });
      await fetchContacts();
    } catch (error) {
      console.error('Error limpiando expirados:', error);
    } finally {
      setClearingExpired(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('⚠️ ¿Eliminar TODOS los contactos ignorados? Esta acción no se puede deshacer.')) return;
    if (!confirm('¿Estás seguro? Se eliminarán ' + stats.total + ' contactos.')) return;
    setClearingAll(true);
    try {
      await fetch('/api/crm-whatsapp/ignored-contacts?action=all', { method: 'PUT' });
      await fetchContacts();
    } catch (error) {
      console.error('Error limpiando todos:', error);
    } finally {
      setClearingAll(false);
    }
  };

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

  // Filtrar y preparar datos para CustomTable
  const filteredContacts = contacts.filter(contact => {
    return showExpired || !contact.is_expired;
  });

  const tableData = filteredContacts.map(contact => ({
    id: contact.id.toString(),
    phone: contact.phone,
    reason: contact.reason || '-',
    first_message: contact.first_message || '-',
    ignored_at: contact.ignored_at,
    time_remaining: getTimeRemaining(contact.expires_at),
    is_expired: contact.is_expired,
  }));

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Contactos Ignorados
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestión completa de contactos que la IA no responderá
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Contacto
        </motion.button>
      </div>

      {/* Formulario para agregar contacto */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
              <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Agregar Contacto a Ignorados
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="5491112345678"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Razón (opcional)
                  </label>
                  <input
                    type="text"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    placeholder="Ej: Spam, no interesado, competencia..."
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Duración (horas)
                  </label>
                  <select
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="24">1 día</option>
                    <option value="72">3 días</option>
                    <option value="168">7 días</option>
                    <option value="720">30 días</option>
                    <option value="8760">1 año</option>
                  </select>
                </div>
              </div>

              {addError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"
                >
                  {addError}
                </motion.div>
              )}

              <div className="flex gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddContact}
                  disabled={addingContact}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {addingContact && (
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  Agregar
                </motion.button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setAddError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700"
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Total</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700"
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
          <div className="text-sm text-green-700 dark:text-green-300">Activos</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-200 dark:border-amber-700"
        >
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.expired}</div>
          <div className="text-sm text-amber-700 dark:text-amber-300">Expirados</div>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={showExpired}
            onChange={(e) => setShowExpired(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          Mostrar expirados
        </label>
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchContacts}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Actualizar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearExpired}
            disabled={clearingExpired || stats.expired === 0}
            className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {clearingExpired && (
              <motion.div
                className="w-3 h-3 border-2 border-amber-600/30 border-t-amber-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            )}
            Limpiar expirados
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearAll}
            disabled={clearingAll || stats.total === 0}
            className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {clearingAll && (
              <motion.div
                className="w-3 h-3 border-2 border-red-600/30 border-t-red-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            )}
            Limpiar todos
          </motion.button>
        </div>
      </div>

      {/* CustomTable */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: '400px' }}>
        <CustomTable
          data={tableData}
          columnsDef={ignoredContactsColumns}
          pageSize={50}
          loading={loading}
          showFiltersToolbar={true}
          containerHeight="100%"
          rowHeight={28}
          onCellEdit={async (rowId: string, _colId: string, _newValue: string) => {
            // Solo permitimos eliminar, no editar
            await handleDeleteContact(rowId);
          }}
          onRefresh={fetchContacts}
        />
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Información</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Los contactos en esta lista no recibirán respuestas automáticas de la IA</li>
              <li>• Cuando expiran, vuelven a ser elegibles para que la IA los evalúe</li>
              <li>• Usa el botón "Agregar Contacto" para ignorar números manualmente</li>
            </ul>
          </div>
        </div>
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
          Estas reglas definen el comportamiento fundamental del asistente en todas las conversaciones
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
        <p className="mt-2 text-xs text-gray-500">
          Cada línea representa una regla que el asistente seguirá en todas las conversaciones
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Importante</h4>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Modificá estas reglas con cuidado. Afectan directamente cómo responde el asistente a todos los clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
