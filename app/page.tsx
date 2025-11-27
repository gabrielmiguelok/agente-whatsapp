'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildColumnsFromDefinition } from '@/CustomTable/CustomTableColumnsConfig';
import { useTableData } from '@/lib/hooks/useTableData';
import CustomTable from '@/CustomTable';
import {
  StatusIndicator,
  QRCodeDisplay,
  ActionButton,
  PromptEditor,
} from '@/components/crm-whatsapp';
import type { SessionStatus as StatusType } from '@/lib/whatsapp/types';
import type { PromptConfig } from '@/lib/whatsapp/types/promptConfig';
import { useRouter } from 'next/navigation';

const SESSION_ID = 'default';
const CONTACTS_DYNAMIC_FIELDS = ['seguimiento', 'accion', 'zona'];

const contactsColumns = buildColumnsFromDefinition({
  phone: { type: 'text', header: 'TELÉFONO', width: 150 },
  name: { type: 'text', header: 'NOMBRE', width: 180 },
  email: { type: 'text', header: 'EMAIL', width: 220 },
  seguimiento: {
    type: 'badge',
    header: 'SEGUIMIENTO',
    width: 140,
    allowCreate: true,
    useDynamicOptions: true,
    dataset: 'contacts',
  },
  accion: {
    type: 'badge',
    header: 'ACCIÓN',
    width: 120,
    allowCreate: true,
    useDynamicOptions: true,
    dataset: 'contacts',
  },
  zona: {
    type: 'badge',
    header: 'ZONA',
    width: 140,
    allowCreate: true,
    useDynamicOptions: true,
    dataset: 'contacts',
  },
  presupuesto: {
    type: 'currency',
    header: 'PRESUPUESTO',
    width: 140,
    currencySymbol: '$',
    currencyLocale: 'es-AR',
  },
  created_at: { type: 'date', header: 'CREADO', width: 160 },
  updated_at: { type: 'date', header: 'ACTUALIZADO', width: 160 },
});

const messagesColumns = buildColumnsFromDefinition({
  phone: { type: 'text', header: 'TELÉFONO', width: 140 },
  name: { type: 'text', header: 'NOMBRE', width: 150 },
  direction: {
    type: 'badge',
    header: 'DIRECCIÓN',
    width: 120,
    options: [
      { value: 'ENVIADO', label: 'ENVIADO' },
      { value: 'RECIBIDO', label: 'RECIBIDO' },
    ]
  },
  message: { type: 'text', header: 'MENSAJE', width: 400 },
  created_at: { type: 'date', header: 'FECHA', width: 160 },
});

const usersColumns = buildColumnsFromDefinition({
  id: { type: 'numeric', header: 'ID', width: 60, editable: false },
  email: { type: 'text', header: 'EMAIL', width: 250 },
  full_name: { type: 'avatar', header: 'NOMBRE', width: 200 },
  role: {
    type: 'badge',
    header: 'ROL',
    width: 120,
    options: [
      { value: 'admin', label: 'admin' },
      { value: 'user', label: 'user' },
    ],
  },
  created_at: { type: 'date', header: 'CREADO', width: 160, editable: false },
  updated_at: { type: 'date', header: 'ACTUALIZADO', width: 160, editable: false },
});

type MainTab = 'contacts' | 'messages' | 'whatsapp' | 'config' | 'users';

interface SessionData {
  email: string;
  status: StatusType;
  phone: string | null;
  qrCode: string | null;
  connectedAt: string | null;
  inMemory: boolean;
}

interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

const NavIcons = {
  contacts: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  messages: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  whatsapp: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  config: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MainTab>('contacts');
  const [isHydrated, setIsHydrated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string | null; role: string } | null>(null);

  const [optionsCache, setOptionsCache] = useState<Record<string, Array<{ value: string; label: string }>>>({});

  const [session, setSession] = useState<SessionData | null>(null);
  const [wsLoading, setWsLoading] = useState(true);
  const [wsError, setWsError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const { data, loading, error, updateCell, refetch } = useTableData({
    dataset: activeTab === 'contacts' || activeTab === 'messages' ? activeTab : 'contacts',
  });

  useEffect(() => {
    setIsHydrated(true);
    verifyAuthAndRole();
  }, []);

  const verifyAuthAndRole = async () => {
    try {
      const response = await fetch('/api/auth/verify', { cache: 'no-store' });
      if (!response.ok) {
        router.replace('/login');
        return;
      }
      const data = await response.json();
      if (data.user.role !== 'admin') {
        router.replace('/no-autorizado');
        return;
      }
      setCurrentUser({ email: data.user.email, name: data.user.name, role: data.user.role });
      setCheckingAuth(false);
    } catch (error) {
      console.error('Error verifying auth:', error);
      router.replace('/login');
    }
  };

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const handleUserCellEdit = async (rowId: string, colId: string, newValue: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rowId, field: colId, value: newValue }),
      });
      if (response.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id.toString() === rowId ? { ...user, [colId]: newValue } : user
          )
        );
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const loadDynamicOptions = async () => {
    const promises = CONTACTS_DYNAMIC_FIELDS.map(async (field) => {
      try {
        const response = await fetch(`/api/select-options?dataset=contacts&field=${field}`);
        if (!response.ok) return { field, options: [] };
        const result = await response.json();
        if (result.success && Array.isArray(result.options)) {
          return { field, options: result.options.map((opt: string) => ({ value: opt, label: opt })) };
        }
        return { field, options: [] };
      } catch {
        return { field, options: [] };
      }
    });

    const results = await Promise.all(promises);
    const newCache: Record<string, Array<{ value: string; label: string }>> = {};
    results.forEach(({ field, options }) => { newCache[field] = options; });
    setOptionsCache(newCache);
  };

  useEffect(() => {
    if (activeTab === 'contacts') {
      loadDynamicOptions();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'contacts' || activeTab === 'messages') {
      refetch();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  const initializeSession = useCallback(async () => {
    setInitializing(true);
    try {
      const createResponse = await fetch('/api/whatsapp/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: SESSION_ID }),
      });
      const createData = await createResponse.json();
      if (createData.success || createResponse.status === 409) {
        await fetchSession();
      } else {
        throw new Error(createData.error || 'Error inicializando sesión');
      }
    } catch {
      await fetchSession();
    } finally {
      setInitializing(false);
    }
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/whatsapp/sessions/${SESSION_ID}`);
      const data = await response.json();
      if (!data.success) {
        if (response.status === 404) {
          setSession(null);
          return;
        }
        throw new Error(data.error || 'Error cargando sesión');
      }
      setSession(data.data);
      setWsError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error cargando sesión';
      setWsError(message);
    } finally {
      setWsLoading(false);
    }
  }, []);

  const fetchPromptConfig = useCallback(async () => {
    setPromptLoading(true);
    try {
      const response = await fetch('/api/crm-whatsapp/prompt-config');
      const data = await response.json();
      if (data.success) {
        setPromptConfig(data.data);
      }
    } catch (err) {
      console.error('Error cargando config:', err);
    } finally {
      setPromptLoading(false);
    }
  }, []);

  const handleSavePromptConfig = async (key: string, value: string | object) => {
    try {
      const response = await fetch('/api/crm-whatsapp/prompt-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_key: key, config_value: value }),
      });
      if (!response.ok) throw new Error('Error guardando');
      await fetch('/api/crm-whatsapp/prompt-config', { method: 'POST' });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error guardando:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (activeTab === 'whatsapp' || activeTab === 'config') {
      initializeSession();
      fetchPromptConfig();
    }
  }, [activeTab, initializeSession, fetchPromptConfig]);

  useEffect(() => {
    if (!session || activeTab !== 'whatsapp') return;
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [session?.email, fetchSession, activeTab]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const response = await fetch(`/api/whatsapp/sessions/${SESSION_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error ejecutando acción');
      await fetchSession();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error ejecutando acción';
      setWsError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSession = async () => {
    if (!confirm('¿Estás seguro de eliminar la sesión? Se borrarán todas las credenciales y deberás escanear un nuevo QR.')) {
      return;
    }
    setActionLoading('delete');
    try {
      const response = await fetch(`/api/whatsapp/sessions/${SESSION_ID}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error eliminando sesión');
      setSession(null);
      setWsError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error eliminando sesión';
      setWsError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleNewSession = async () => {
    setActionLoading('new');
    try {
      await fetch(`/api/whatsapp/sessions/${SESSION_ID}`, { method: 'DELETE' });
      const response = await fetch('/api/whatsapp/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: SESSION_ID }),
      });
      const data = await response.json();
      if (!data.success && response.status !== 409) {
        throw new Error(data.error || 'Error creando sesión');
      }
      await fetch(`/api/whatsapp/sessions/${SESSION_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      await fetchSession();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creando sesión';
      setWsError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const getColumns = () => {
    if (activeTab === 'messages') return messagesColumns;
    return contactsColumns.map((col: Record<string, unknown>) => {
      if (col.useDynamicOptions && optionsCache[col.accessorKey as string]) {
        return { ...col, options: optionsCache[col.accessorKey as string] };
      }
      return col;
    });
  };

  const tabs = [
    { id: 'contacts' as MainTab, label: 'Contactos', icon: NavIcons.contacts },
    { id: 'messages' as MainTab, label: 'Mensajes', icon: NavIcons.messages },
    { id: 'whatsapp' as MainTab, label: 'WhatsApp', icon: NavIcons.whatsapp },
    { id: 'config' as MainTab, label: 'Config IA', icon: NavIcons.config },
    { id: 'users' as MainTab, label: 'Usuarios', icon: NavIcons.users },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Configuración guardada
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">CRM Onia</h1>
                <div className="flex items-center gap-2">
                  <StatusIndicator status={session?.status || 'disconnected'} size="sm" />
                  {session?.phone && session.status === 'connected' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">{session.phone}</span>
                  )}
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </motion.button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser.name || currentUser.email}
                  </p>
                  <p className="text-xs text-emerald-500">Administrador</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                {NavIcons.logout}
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>

        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-2">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
                {isHydrated && (
                  <CustomTable
                    data={data}
                    columnsDef={getColumns()}
                    pageSize={50}
                    loading={loading}
                    showFiltersToolbar={true}
                    containerHeight="100%"
                    rowHeight={28}
                    onCellEdit={async (rowId: string, colId: string, newValue: string) => {
                      try { await updateCell(rowId, colId, newValue); } catch {}
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
                {isHydrated && (
                  <CustomTable
                    data={data}
                    columnsDef={messagesColumns}
                    pageSize={50}
                    loading={loading}
                    showFiltersToolbar={true}
                    containerHeight="100%"
                    rowHeight={28}
                    onCellEdit={async (rowId: string, colId: string, newValue: string) => {
                      try { await updateCell(rowId, colId, newValue); } catch {}
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Usuarios del Sistema</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Administrá los usuarios y sus permisos. Cambiá el rol a "admin" para otorgar acceso completo.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
                {isHydrated && (
                  <CustomTable
                    data={users}
                    columnsDef={usersColumns}
                    pageSize={50}
                    loading={usersLoading}
                    showFiltersToolbar={true}
                    containerHeight="100%"
                    rowHeight={36}
                    onCellEdit={handleUserCellEdit}
                    onRefresh={fetchUsers}
                  />
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'whatsapp' && (
            <motion.div
              key="whatsapp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Código QR
                  </h2>
                </div>
                <div className="p-6">
                  <QRCodeDisplay qrCode={session?.qrCode || null} status={session?.status || 'disconnected'} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Control de Sesión
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {session?.connectedAt && session?.status === 'connected' && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                            Conectado {session.phone ? `(${session.phone})` : ''}
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            Desde {new Date(session.connectedAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {wsError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{wsError}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones de sesión
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {session?.status !== 'connected' && session?.status !== 'connecting' && (
                        <ActionButton
                          variant="success"
                          onClick={() => handleAction('start')}
                          loading={actionLoading === 'start'}
                          disabled={actionLoading !== null}
                          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        >
                          Iniciar
                        </ActionButton>
                      )}

                      {(session?.status === 'connected' || session?.status === 'connecting' || session?.status === 'qr_pending') && (
                        <ActionButton
                          variant="warning"
                          onClick={() => handleAction('stop')}
                          loading={actionLoading === 'stop'}
                          disabled={actionLoading !== null}
                          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>}
                        >
                          Detener
                        </ActionButton>
                      )}

                      <ActionButton
                        variant="secondary"
                        onClick={fetchSession}
                        disabled={actionLoading !== null}
                        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                      >
                        Actualizar
                      </ActionButton>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Regenerar QR / Nueva sesión
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <ActionButton
                        variant="primary"
                        onClick={handleNewSession}
                        loading={actionLoading === 'new'}
                        disabled={actionLoading !== null}
                        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
                      >
                        Generar Nuevo QR
                      </ActionButton>

                      <ActionButton
                        variant="danger"
                        onClick={handleDeleteSession}
                        loading={actionLoading === 'delete'}
                        disabled={actionLoading !== null}
                        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                      >
                        Eliminar Sesión Completa
                      </ActionButton>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      "Generar Nuevo QR" elimina las credenciales actuales y muestra un nuevo código QR para escanear.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ minHeight: '600px' }}>
                <PromptEditor
                  config={promptConfig}
                  loading={promptLoading}
                  onSave={handleSavePromptConfig}
                  onReload={fetchPromptConfig}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          CRM Onia - Automatización inteligente de WhatsApp con IA
        </div>
      </footer>
    </div>
  );
}
