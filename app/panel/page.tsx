'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildColumnsFromDefinition } from '@/CustomTable/CustomTableColumnsConfig';
import { useTableData } from '@/lib/hooks/useTableData';
import CustomTable from '@/CustomTable';
import {
  StatusIndicator,
  QRCodeDisplay,
  ActionButton,
  PromptEditor,
  ConfirmModal,
} from '@/components/crm-whatsapp';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SessionStatus as StatusType } from '@/lib/whatsapp/types';
import type { PromptConfig } from '@/lib/whatsapp/types/promptConfig';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
  Users,
  MessageSquare,
  Settings,
  LogOut,
  RefreshCw,
  Smartphone,
  Bot,
  Zap,
  Shield,
  Play,
  Square,
  QrCode,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';

const SESSION_ID = 'agentewhatsapp';
const CONTACTS_DYNAMIC_FIELDS = ['accion', 'zona', 'presupuesto'];

const BASE_CONTACTS_COLUMNS = {
  phone: { type: 'text', header: 'TELÉFONO', width: 150 },
  name: { type: 'text', header: 'NOMBRE', width: 180 },
  seguimiento: {
    type: 'badge',
    header: 'SEGUIMIENTO',
    width: 140,
    allowCreate: false,
    options: [
      { value: 'SEGUIMIENTO 1', label: 'SEGUIMIENTO 1' },
      { value: 'SEGUIMIENTO 2', label: 'SEGUIMIENTO 2' },
      { value: 'SEGUIMIENTO 3', label: 'SEGUIMIENTO 3' },
      { value: 'SEGUIMIENTO 4', label: 'SEGUIMIENTO 4' },
    ],
  },
  created_at: { type: 'date', header: 'CREADO', width: 160 },
} as const;

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

const tabConfig = [
  {
    id: 'contacts' as MainTab,
    label: 'Contactos',
    icon: Users,
  },
  {
    id: 'messages' as MainTab,
    label: 'Mensajes',
    icon: MessageSquare,
  },
  {
    id: 'whatsapp' as MainTab,
    label: 'WhatsApp',
    icon: Smartphone,
  },
  {
    id: 'config' as MainTab,
    label: 'Config IA',
    icon: Bot,
  },
  {
    id: 'users' as MainTab,
    label: 'Usuarios',
    icon: Shield,
  },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    positive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-400/10 dark:to-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {value}
            </h3>
            {trend && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                <TrendingUp className={`w-3 h-3 ${!trend.positive && 'rotate-180'}`} />
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PanelPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MainTab>('contacts');
  const [isHydrated, setIsHydrated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string | null; role: string; picture?: string } | null>(null);

  const [optionsCache, setOptionsCache] = useState<Record<string, Array<{ value: string; label: string }>>>({});

  const [session, setSession] = useState<SessionData | null>(null);
  const [wsLoading, setWsLoading] = useState(true);
  const [wsError, setWsError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [showDeleteSessionModal, setShowDeleteSessionModal] = useState(false);

  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [dynamicColumns, setDynamicColumns] = useState<Array<{ name: string; type: string }>>([]);

  const { data, loading, error, updateCell, refetch } = useTableData({
    dataset: activeTab === 'contacts' || activeTab === 'messages' ? activeTab : 'contacts',
  });

  const contactsColumns = useMemo(() => {
    const dynamicDefs: Record<string, any> = {};
    dynamicColumns.forEach((col) => {
      const isNumeric = ['decimal', 'int', 'bigint', 'float', 'double'].includes(col.type?.toLowerCase() || '');

      if (isNumeric) {
        dynamicDefs[col.name] = {
          type: 'currency',
          header: col.name.toUpperCase().replace(/_/g, ' '),
          width: 140,
          currencySymbol: '$',
          currencyLocale: 'es-AR',
        };
      } else {
        dynamicDefs[col.name] = {
          type: 'badge',
          header: col.name.toUpperCase().replace(/_/g, ' '),
          width: 140,
          allowCreate: true,
          useDynamicOptions: true,
          dataset: 'contacts',
        };
      }
    });

    return buildColumnsFromDefinition({
      ...BASE_CONTACTS_COLUMNS,
      ...dynamicDefs,
    });
  }, [dynamicColumns]);

  const fetchDynamicColumns = useCallback(async () => {
    try {
      const response = await fetch('/api/contacts/columns');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDynamicColumns(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dynamic columns:', error);
    }
  }, []);

  const handleAddColumn = useCallback(async (columnName: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/contacts/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnName, columnType: 'badge' }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Error al crear columna');
        return false;
      }

      toast.success(`Columna "${result.data.displayName}" creada`);
      await fetchDynamicColumns();
      await refetch();
      return true;
    } catch (error) {
      console.error('Error adding column:', error);
      toast.error('Error al crear columna');
      return false;
    }
  }, [fetchDynamicColumns, refetch]);

  const handleDeleteColumn = useCallback(async (columnName: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/contacts/columns?name=${encodeURIComponent(columnName)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Error al eliminar columna');
        return false;
      }

      toast.success(`Columna "${columnName.toUpperCase().replace(/_/g, ' ')}" eliminada`);
      await fetchDynamicColumns();
      await refetch();
      return true;
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error('Error al eliminar columna');
      return false;
    }
  }, [fetchDynamicColumns, refetch]);

  const deletableColumnNames = useMemo(() => {
    return dynamicColumns.map((col) => col.name);
  }, [dynamicColumns]);

  useEffect(() => {
    setIsHydrated(true);
    verifyAuthAndRole();
    fetchDynamicColumns();
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
      setCurrentUser({
        email: data.user.email,
        name: data.user.fullName || data.user.firstName || data.user.email,
        role: data.user.role,
        picture: data.user.picture
      });
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
        toast.success('Usuario actualizado');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
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
      toast.success('Configuración guardada');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error guardando:', err);
      toast.error('Error al guardar configuración');
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
      toast.success(action === 'start' ? 'Sesión iniciada' : 'Sesión detenida');
      await fetchSession();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error ejecutando acción';
      setWsError(message);
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSession = async () => {
    setActionLoading('delete');
    try {
      const response = await fetch(`/api/whatsapp/sessions/${SESSION_ID}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error eliminando sesión');
      setSession(null);
      setWsError(null);
      setShowDeleteSessionModal(false);
      toast.success('Sesión eliminada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error eliminando sesión';
      setWsError(message);
      toast.error(message);
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
      toast.success('Nuevo QR generado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creando sesión';
      setWsError(message);
      toast.error(message);
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

  const getStatusColor = (status: StatusType | undefined) => {
    switch (status) {
      case 'connected': return 'bg-emerald-500';
      case 'connecting': return 'bg-yellow-500';
      case 'qr_pending': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messagesToday = Array.isArray(data)
      ? data.filter((msg: any) => new Date(msg.created_at) >= today).length
      : 0;

    const totalContacts = activeTab === 'contacts' ? (Array.isArray(data) ? data.length : 0) : 0;

    const connectedSince = session?.connectedAt
      ? (() => {
          const diff = Date.now() - new Date(session.connectedAt).getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const days = Math.floor(hours / 24);
          return days > 0 ? `${days}d ${hours % 24}h` : `${hours}h`;
        })()
      : '-';

    return {
      totalContacts,
      messagesToday,
      whatsappStatus: session?.status || 'disconnected',
      connectedSince,
    };
  }, [data, activeTab, session]);

  if (checkingAuth || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-400 rounded-xl"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 font-medium"
          >
            Verificando acceso...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster position="top-right" />

      {/* Compact Header */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
      >
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm relative">
                <Zap className="w-5 h-5 text-white" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(session?.status)}`} />
              </div>

              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                  Panel de Control
                </h1>
                <div className="flex items-center gap-2">
                  <StatusIndicator status={session?.status || 'disconnected'} size="sm" showLabel={false} />
                  {session?.status === 'connected' && session.phone && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {session.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {currentUser.picture ? (
                  <img
                    src={currentUser.picture}
                    alt=""
                    className="w-8 h-8 rounded-lg"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentUser.name}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 h-8 px-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MainTab)} className="space-y-4">
          {/* Compact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <StatCard
              title="Contactos"
              value={stats.totalContacts}
              icon={Users}
              trend={{ value: "+12%", positive: true }}
            />
            <StatCard
              title="Mensajes hoy"
              value={stats.messagesToday}
              icon={MessageSquare}
              trend={{ value: "+8%", positive: true }}
            />
            <StatCard
              title="WhatsApp"
              value={session?.status === 'connected' ? 'Conectado' : 'Desconectado'}
              icon={Smartphone}
            />
            <StatCard
              title="Tiempo activo"
              value={stats.connectedSince}
              icon={Clock}
            />
          </motion.div>

          {/* Compact Tab Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1"
          >
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content: Contacts */}
          <AnimatePresence mode="wait">
            <TabsContent value="contacts" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/10 dark:to-cyan-400/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Contactos</CardTitle>
                          <CardDescription className="text-xs">
                            Base de contactos de WhatsApp
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {stats.totalContacts} contactos
                      </Badge>
                    </div>
                  </CardHeader>
                  <div style={{ height: 'calc(100vh - 360px)' }}>
                    {isHydrated && (
                      <CustomTable
                        data={data}
                        columnsDef={getColumns()}
                        pageSize={50}
                        loading={loading}
                        showFiltersToolbar={true}
                        containerHeight="100%"
                        rowHeight={32}
                        onCellEdit={async (rowId: string, colId: string, newValue: string) => {
                          try { await updateCell(rowId, colId, newValue); } catch {}
                        }}
                        onAddColumn={handleAddColumn}
                        onDeleteColumn={handleDeleteColumn}
                        deletableColumns={deletableColumnNames}
                        onRefresh={refetch}
                      />
                    )}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Tab Content: Messages */}
            <TabsContent value="messages" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-400/10 dark:to-pink-400/10 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Mensajes</CardTitle>
                          <CardDescription className="text-xs">
                            Historial de conversaciones
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {stats.messagesToday} hoy
                      </Badge>
                    </div>
                  </CardHeader>
                  <div style={{ height: 'calc(100vh - 360px)' }}>
                    {isHydrated && (
                      <CustomTable
                        data={data}
                        columnsDef={messagesColumns}
                        pageSize={50}
                        loading={loading}
                        showFiltersToolbar={true}
                        containerHeight="100%"
                        rowHeight={32}
                        onRefresh={refetch}
                      />
                    )}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Tab Content: WhatsApp */}
            <TabsContent value="whatsapp" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {/* QR Card */}
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/10 dark:to-teal-400/10 flex items-center justify-center">
                        <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Código QR</CardTitle>
                        <CardDescription className="text-xs">
                          Escanear con WhatsApp
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="relative">
                      <QRCodeDisplay
                        qrCode={session?.qrCode || null}
                        status={session?.status || 'disconnected'}
                      />
                      {session?.status === 'connected' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
                        >
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Control Card */}
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-400/10 dark:to-orange-400/10 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Control de Sesión</CardTitle>
                        <CardDescription className="text-xs">
                          Gestiona la conexión
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {session?.connectedAt && session?.status === 'connected' && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                              Conectado
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              {session.phone && `${session.phone} • `}
                              {new Date(session.connectedAt).toLocaleString('es-AR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {wsError && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50"
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <p className="text-xs text-red-600 dark:text-red-400">{wsError}</p>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Acciones
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {session?.status !== 'connected' && session?.status !== 'connecting' && (
                          <ActionButton
                            variant="success"
                            onClick={() => handleAction('start')}
                            loading={actionLoading === 'start'}
                            disabled={actionLoading !== null}
                            icon={<Play className="w-4 h-4" />}
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
                            icon={<Square className="w-4 h-4" />}
                          >
                            Detener
                          </ActionButton>
                        )}

                        <ActionButton
                          variant="secondary"
                          onClick={fetchSession}
                          disabled={actionLoading !== null}
                          icon={<RefreshCw className="w-4 h-4" />}
                        >
                          Actualizar
                        </ActionButton>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Avanzado
                      </p>
                      <div className="space-y-2">
                        <ActionButton
                          variant="primary"
                          onClick={handleNewSession}
                          loading={actionLoading === 'new'}
                          disabled={actionLoading !== null}
                          icon={<QrCode className="w-4 h-4" />}
                          className="w-full"
                        >
                          Generar Nuevo QR
                        </ActionButton>

                        <ActionButton
                          variant="danger"
                          onClick={() => setShowDeleteSessionModal(true)}
                          disabled={actionLoading !== null}
                          icon={<Trash2 className="w-4 h-4" />}
                          className="w-full"
                        >
                          Eliminar Sesión
                        </ActionButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Tab Content: Config IA - Sin wrapper Card para diseño más limpio */}
            <TabsContent value="config" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border border-gray-200 dark:border-gray-800 bg-background overflow-hidden"
                style={{ height: 'calc(100vh - 260px)', minHeight: '450px' }}
              >
                <PromptEditor
                  config={promptConfig}
                  loading={promptLoading}
                  onSave={handleSavePromptConfig}
                  onReload={fetchPromptConfig}
                />
              </motion.div>
            </TabsContent>

            {/* Tab Content: Users */}
            <TabsContent value="users" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/10 to-red-500/10 dark:from-rose-400/10 dark:to-red-400/10 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Usuarios</CardTitle>
                          <CardDescription className="text-xs">
                            Administra permisos de acceso
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {users.length} usuarios
                      </Badge>
                    </div>
                  </CardHeader>
                  <div style={{ height: 'calc(100vh - 360px)' }}>
                    {isHydrated && (
                      <CustomTable
                        data={users}
                        columnsDef={usersColumns}
                        pageSize={50}
                        loading={usersLoading}
                        showFiltersToolbar={true}
                        containerHeight="100%"
                        rowHeight={40}
                        onCellEdit={handleUserCellEdit}
                        onRefresh={fetchUsers}
                      />
                    )}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Compact Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-3 mt-auto"
      >
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium">Panel WhatsApp</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://delegar.space"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                delegar.space
              </a>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Sistema activo</span>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Modal de confirmación para eliminar sesión */}
      <ConfirmModal
        isOpen={showDeleteSessionModal}
        onClose={() => setShowDeleteSessionModal(false)}
        onConfirm={handleDeleteSession}
        title="Eliminar sesión de WhatsApp"
        message="¿Estás seguro? Se borrarán las credenciales guardadas y deberás escanear un nuevo código QR para volver a conectar."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={actionLoading === 'delete'}
      />
    </div>
  );
}
