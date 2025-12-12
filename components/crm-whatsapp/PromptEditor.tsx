'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Target, Lightbulb, Zap, ShieldOff, Lock,
  Plus, X, Sparkles, Info, AlertTriangle, Trash2,
  Clock, CheckCircle2, RefreshCw, Save, ChevronRight
} from 'lucide-react';
import type { PromptConfig, MissionField } from '@/lib/whatsapp/types/promptConfig';
import CustomTable from '@/CustomTable';
import { buildColumnsFromDefinition } from '@/CustomTable/CustomTableColumnsConfig';
import { ConfirmModal } from './ConfirmModal';

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

const tabs: { id: TabId; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { id: 'identity', label: 'Identidad', shortLabel: 'ID', icon: User },
  { id: 'mission', label: 'Misión', shortLabel: 'MIS', icon: Target },
  { id: 'strategy', label: 'Estrategia', shortLabel: 'EST', icon: Lightbulb },
  { id: 'trigger', label: 'Disparador', shortLabel: 'TRG', icon: Zap },
  { id: 'ignored', label: 'Ignorados', shortLabel: 'IGN', icon: ShieldOff },
  { id: 'rules', label: 'Reglas', shortLabel: 'RUL', icon: Lock },
];

export function PromptEditor({ config, loading, onSave, onReload }: PromptEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('identity');
  const [saving, setSaving] = useState(false);
  const [localConfig, setLocalConfig] = useState<PromptConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
      setHasChanges(false);
    }
  }, [config]);

  const handleChange = useCallback((key: string, value: unknown) => {
    setLocalConfig(prev => prev ? { ...prev, [key]: value } : null);
    setHasChanges(true);
  }, []);

  const handleSaveAll = async () => {
    if (!localConfig) return;
    setSaving(true);
    try {
      const keys = [
        'assistant_name', 'mission_fields', 'conversation_strategy', 'question_examples',
        'mission_complete_message', 'extraction_rules', 'base_identity', 'unbreakable_rules',
        'trigger_criteria', 'trigger_examples_positive', 'trigger_examples_negative',
        'trigger_vip_phones', 'trigger_context_instructions', 'trigger_ignore_duration_hours',
        'trigger_keywords',
      ];
      for (const key of keys) {
        const value = localConfig[key as keyof PromptConfig];
        if (value !== undefined) await onSave(key, value as string | object);
      }
      setHasChanges(false);
      setShowSaveSuccessModal(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2">
        <motion.div
          className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  if (!localConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-muted-foreground">No se pudo cargar</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
      {/* Sidebar - Vertical en desktop, horizontal en mobile */}
      <div className="flex-shrink-0 lg:w-44 border-b lg:border-b-0 lg:border-r border-border bg-muted/30">
        {/* Mobile: horizontal scroll */}
        <nav className="flex lg:flex-col gap-1 p-2 overflow-x-auto lg:overflow-visible"
             style={{ WebkitOverflowScrolling: 'touch' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                           whitespace-nowrap transition-all flex-shrink-0
                           ${isActive
                             ? 'bg-foreground text-background'
                             : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline lg:inline">{tab.label}</span>
                <span className="sm:hidden lg:hidden">{tab.shortLabel}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto hidden lg:block" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 lg:p-6">
            {activeTab === 'identity' && <IdentityTab config={localConfig} onChange={handleChange} />}
            {activeTab === 'mission' && <MissionTab config={localConfig} onChange={handleChange} />}
            {activeTab === 'strategy' && <StrategyTab config={localConfig} onChange={handleChange} />}
            {activeTab === 'trigger' && <TriggerTab config={localConfig} onChange={handleChange} />}
            {activeTab === 'ignored' && <IgnoredTab />}
            {activeTab === 'rules' && <RulesTab config={localConfig} onChange={handleChange} />}
          </div>
        </div>
      </div>

      {/* FAB - Floating Action Button para guardar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
          >
            <motion.button
              onClick={onReload}
              disabled={saving}
              className="w-10 h-10 rounded-full bg-muted border border-border shadow-lg
                         flex items-center justify-center text-muted-foreground hover:text-foreground
                         transition-all disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={handleSaveAll}
              disabled={saving}
              className="h-10 px-4 rounded-full bg-emerald-600 text-white shadow-lg
                         flex items-center gap-2 font-semibold text-sm
                         hover:bg-emerald-700 transition-all disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {saving ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showSaveSuccessModal}
        onClose={() => setShowSaveSuccessModal(false)}
        title="¡Guardado!"
        message="La IA ya está usando los nuevos ajustes."
        confirmText="OK"
        variant="success"
        showCancel={false}
        onConfirm={() => setShowSaveSuccessModal(false)}
      />
    </div>
  );
}

// === COMPONENTES BASE ===

function Input({ value, onChange, placeholder, type = 'text', className = '' }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-sm rounded-lg border border-border bg-background
                 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all
                 placeholder:text-muted-foreground/50 ${className}`}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, mono, className = '' }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none
                 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all
                 placeholder:text-muted-foreground/50 ${mono ? 'font-mono text-xs' : ''} ${className}`}
    />
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 mb-1.5">
      <label className="text-xs font-semibold text-foreground">{children}</label>
      {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

// === TABS ===

function IdentityTab({ config, onChange }: { config: PromptConfig; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-purple-500" />
          Identidad del Asistente
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Configurá cómo se presenta la IA</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Label hint="Variable: {assistant_name}">Nombre</Label>
          <Input
            value={config.assistant_name}
            onChange={(v) => onChange('assistant_name', v)}
            placeholder="Ej: Ana, Carlos..."
          />
        </div>
        <div className="lg:row-span-2">
          <Label hint="Personalidad y contexto">Identidad Base</Label>
          <Textarea
            value={config.base_identity || ''}
            onChange={(v) => onChange('base_identity', v)}
            rows={8}
            mono
            placeholder="Sos {assistant_name}, asistente virtual..."
          />
        </div>
        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
          <p className="text-xs text-purple-600 dark:text-purple-400">
            <strong>Tip:</strong> Usá un nombre simple y una identidad clara que represente tu marca.
          </p>
        </div>
      </div>
    </div>
  );
}

function MissionTab({ config, onChange }: { config: PromptConfig; onChange: (k: string, v: unknown) => void }) {
  const [fields, setFields] = useState<MissionField[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/crm-whatsapp/mission-fields')
      .then(r => r.json())
      .then(d => d.success && setFields(d.data))
      .finally(() => setLoading(false));
  }, []);

  const missionFields = Array.isArray(config.mission_fields) ? config.mission_fields : [];
  const examples = config.question_examples || {};
  const rules = config.extraction_rules || {};
  const isActive = (key: string) => missionFields.some(f => f.key === key);

  const toggle = (field: MissionField) => {
    if (isActive(field.key)) {
      onChange('mission_fields', missionFields.filter(f => f.key !== field.key));
      const newEx = { ...examples }; delete newEx[field.key];
      const newRu = { ...rules }; delete newRu[field.key];
      onChange('question_examples', newEx);
      onChange('extraction_rules', newRu);
      if (expanded === field.key) setExpanded(null);
    } else {
      onChange('mission_fields', [...missionFields, { ...field }]);
      onChange('question_examples', { ...examples, [field.key]: ['', ''] });
      onChange('extraction_rules', { ...rules, [field.key]: '' });
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground py-8 text-center">Cargando campos...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Datos a Recopilar
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Campos que la IA debe obtener de cada cliente</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Lista de campos */}
        <div className="space-y-2">
          {fields.map(field => {
            const active = isActive(field.key);
            const open = expanded === field.key;
            const fieldConfig = missionFields.find(f => f.key === field.key);

            return (
              <div key={field.key} className={`rounded-lg border transition-all ${active ? 'border-blue-500/50 bg-blue-500/5' : 'border-border'}`}>
                <div className="flex items-center gap-3 p-2.5">
                  <button
                    onClick={() => toggle(field)}
                    className={`w-9 h-5 rounded-full transition-all flex-shrink-0 relative ${active ? 'bg-blue-600' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${active ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{field.label}</span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{field.type}</span>
                  </div>
                  {active && (
                    <button onClick={() => setExpanded(open ? null : field.key)} className="text-xs text-blue-600 hover:underline">
                      {open ? 'Cerrar' : 'Config'}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {active && open && fieldConfig && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-3 space-y-2 border-t border-border/50 bg-blue-500/5">
                        <div>
                          <Label>Descripción</Label>
                          <Input
                            value={fieldConfig.description || ''}
                            onChange={(v) => onChange('mission_fields', missionFields.map(f => f.key === field.key ? { ...f, description: v } : f))}
                            placeholder="Qué debe obtener la IA"
                          />
                        </div>
                        <div>
                          <Label>Regla de extracción</Label>
                          <Textarea
                            value={rules[field.key] || ''}
                            onChange={(v) => onChange('extraction_rules', { ...rules, [field.key]: v })}
                            rows={2}
                            placeholder="Cómo detectar..."
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Mensaje de completar */}
        <div>
          <Label hint="Cuando obtiene todos los datos">Mensaje al completar</Label>
          <Textarea
            value={config.mission_complete_message || ''}
            onChange={(v) => onChange('mission_complete_message', v)}
            rows={6}
            placeholder="Gracias por la info, un asesor te contacta..."
          />
          <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>{missionFields.length}</strong> campos activos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyTab({ config, onChange }: { config: PromptConfig; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Estrategia de Conversación
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Instrucciones de cómo debe interactuar</p>
      </div>

      <div>
        <Label hint="Cada línea = una instrucción">Instrucciones</Label>
        <Textarea
          value={config.conversation_strategy}
          onChange={(v) => onChange('conversation_strategy', v)}
          rows={16}
          mono
          placeholder="1. Saludá de forma cálida&#10;2. Preguntá el nombre..."
        />
      </div>

      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          <strong>Tip:</strong> Priorizá instrucciones claras y evitá contradicciones.
        </p>
      </div>
    </div>
  );
}

function KeywordsPills({ keywords, onChange }: { keywords: string; onChange: (v: string) => void }) {
  const [input, setInput] = useState('');
  const list = keywords.split(',').map(k => k.trim()).filter(Boolean);

  const add = () => {
    const k = input.trim().toLowerCase();
    if (k && !list.includes(k)) { onChange([...list, k].join(',')); setInput(''); }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Agregar..."
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-emerald-500/50 bg-background focus:ring-2 focus:ring-emerald-500/20"
        />
        <button onClick={add} disabled={!input.trim()} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium disabled:opacity-50">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {list.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {list.map(k => (
            <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-xs">
              {k}
              <button onClick={() => onChange(list.filter(x => x !== k).join(','))} className="hover:bg-white/20 rounded">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function TriggerTab({ config, onChange }: { config: PromptConfig; onChange: (k: string, v: unknown) => void }) {
  const c = config as Record<string, string>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-500" />
          Disparador Inteligente
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Cuándo debe activarse la IA</p>
      </div>

      {/* Keywords - Destacado */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Keywords Prioritarias</span>
        </div>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mb-3">
          Match instantáneo sin IA. Incluye fuzzy matching (flora→flota).
        </p>
        <KeywordsPills keywords={c.trigger_keywords || ''} onChange={(v) => onChange('trigger_keywords', v)} />
      </div>

      {/* Grid de configuración */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label hint="Si no hay keyword match">Criterio IA</Label>
          <Textarea value={c.trigger_criteria || ''} onChange={(v) => onChange('trigger_criteria', v)} rows={4} placeholder="Iniciar si..." />
        </div>
        <div>
          <Label>Contexto adicional</Label>
          <Textarea value={c.trigger_context_instructions || ''} onChange={(v) => onChange('trigger_context_instructions', v)} rows={4} mono placeholder="Instrucciones extra..." />
        </div>
        <div>
          <Label hint="Separar con |">Ejemplos positivos</Label>
          <Textarea value={c.trigger_examples_positive || ''} onChange={(v) => onChange('trigger_examples_positive', v)} rows={3} placeholder="busco furgón|quiero sprinter" />
        </div>
        <div>
          <Label hint="Separar con |">Ejemplos negativos</Label>
          <Textarea value={c.trigger_examples_negative || ''} onChange={(v) => onChange('trigger_examples_negative', v)} rows={3} placeholder="spam|publicidad" />
        </div>
        <div>
          <Label hint="Separar con coma">Números VIP</Label>
          <Input value={c.trigger_vip_phones || ''} onChange={(v) => onChange('trigger_vip_phones', v)} placeholder="5491112345678, ..." />
        </div>
        <div>
          <Label>Duración ignorados (horas)</Label>
          <Input value={c.trigger_ignore_duration_hours || '168'} onChange={(v) => onChange('trigger_ignore_duration_hours', v)} type="number" />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          <strong>Flujo:</strong> VIP → Ignorados → Keywords → IA
        </p>
      </div>
    </div>
  );
}

const ignoredColumns = buildColumnsFromDefinition({
  phone: { type: 'text', header: 'Teléfono', width: 130 },
  reason: { type: 'text', header: 'Razón', width: 150 },
  first_message: { type: 'text', header: 'Mensaje', width: 180 },
  time_remaining: { type: 'badge', header: 'Expira', width: 80 },
});

function IgnoredTab() {
  const [contacts, setContacts] = useState<IgnoredContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/crm-whatsapp/ignored-contacts');
      const d = await r.json();
      if (d.success) { setContacts(d.data); setStats(d.stats); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const getRemaining = (exp: string | null) => {
    if (!exp) return 'Perm';
    const diff = new Date(exp).getTime() - Date.now();
    if (diff <= 0) return 'Exp';
    const h = Math.floor(diff / 3600000);
    return h >= 24 ? `${Math.floor(h / 24)}d` : `${h}h`;
  };

  const deleteAll = async () => {
    setDeleting('all');
    try {
      const r = await fetch('/api/crm-whatsapp/ignored-contacts?action=all', { method: 'PUT' });
      if ((await r.json()).success) { await fetch_(); setShowDeleteModal(false); setShowSuccessModal(true); }
    } finally { setDeleting(null); }
  };

  const deleteExpired = async () => {
    setDeleting('exp');
    try { await fetch('/api/crm-whatsapp/ignored-contacts?action=expired', { method: 'PUT' }); await fetch_(); }
    finally { setDeleting(null); }
  };

  const data = contacts.filter(c => !c.is_expired).map(c => ({
    id: String(c.id), phone: c.phone, reason: c.reason || '-',
    first_message: c.first_message || '-', time_remaining: getRemaining(c.expires_at),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldOff className="w-5 h-5 text-rose-500" />
            Ignorados
            <span className="text-sm font-normal text-muted-foreground">({stats.active})</span>
          </h2>
        </div>
        <div className="flex gap-1.5">
          {stats.expired > 0 && (
            <button onClick={deleteExpired} disabled={!!deleting}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 disabled:opacity-50">
              <Clock className="w-3.5 h-3.5" />{stats.expired} exp
            </button>
          )}
          <button onClick={() => setShowDeleteModal(true)} disabled={!!deleting || stats.active === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" />Borrar
          </button>
        </div>
      </div>

      <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={deleteAll}
        title="Borrar todos" message={`¿Eliminar ${stats.active} contactos?`} confirmText="Sí" variant="danger" loading={deleting === 'all'} />
      <ConfirmModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}
        title="Listo" message="Eliminados." confirmText="OK" variant="success" showCancel={false} onConfirm={() => setShowSuccessModal(false)} />

      {stats.active === 0 ? (
        <div className="p-8 text-center rounded-lg border border-dashed border-border">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
          <p className="text-sm text-muted-foreground">Lista vacía</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden" style={{ height: '350px' }}>
          <CustomTable data={data} columnsDef={ignoredColumns} pageSize={50} loading={loading} containerHeight="100%" rowHeight={32} onRefresh={fetch_} />
        </div>
      )}
    </div>
  );
}

function RulesTab({ config, onChange }: { config: PromptConfig; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-500" />
          Reglas Inquebrantables
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Máxima prioridad en todas las conversaciones</p>
      </div>

      <div>
        <Label>Reglas de comportamiento</Label>
        <Textarea
          value={config.unbreakable_rules || ''}
          onChange={(v) => onChange('unbreakable_rules', v)}
          rows={18}
          mono
          placeholder="1. Mensajes cortos&#10;2. Nunca revelar que sos IA..."
        />
      </div>

      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          <strong>Importante:</strong> Estas reglas tienen máxima prioridad. Cambialas con cuidado.
        </p>
      </div>
    </div>
  );
}
