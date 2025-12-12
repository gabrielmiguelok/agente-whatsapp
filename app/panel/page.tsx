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
  ChevronRight,
  LayoutDashboard
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
  { id: 'contacts' as MainTab, label: 'Contactos', icon: Users, description: 'Gestiona tus contactos de WhatsApp' },
  { id: 'messages' as MainTab, label: 'Mensajes', icon: MessageSquare, description: 'Historial de conversaciones' },
  { id: 'whatsapp' as MainTab, label: 'WhatsApp', icon: Smartphone, description: 'Conexión y estado' },
  { id: 'config' as MainTab, label: 'Config IA', icon: Bot, description: 'Configuración del asistente' },
  { id: 'users' as MainTab, label: 'Usuarios', icon: Shield, description: 'Administración de usuarios' },
];

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
    if (!confirm('¿Eliminar la sesión? Se borrarán las credenciales y deberás escanear un nuevo QR.')) {
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

  if (checkingAuth || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y estado */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(session?.status)}`} />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Panel de Control</h1>
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={session?.status || 'disconnected'} size="sm" showLabel />
                  </div>
                </div>
              </div>
            </div>

            {/* Usuario y acciones */}
            <div className="flex items-center gap-3">
              {session?.phone && session.status === 'connected' && (
                <Badge variant="outline" className="hidden md:flex gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                  <Smartphone className="w-3.5 h-3.5" />
                  {session.phone}
                </Badge>
              )}

              <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
                {currentUser.picture ? (
                  <img src={currentUser.picture} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Admin</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MainTab)} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-1.5 shadow-sm border border-gray-200 dark:border-gray-700/50">
            <TabsList className="grid grid-cols-5 gap-1 bg-transparent h-auto p-0">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-400 data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:dark:hover:bg-gray-700/50"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content: Contacts */}
          <TabsContent value="contacts" className="mt-0">
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-800/50 overflow-hidden">
              <div style={{ height: 'calc(100vh - 220px)' }}>
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
          </TabsContent>

          {/* Tab Content: Messages */}
          <TabsContent value="messages" className="mt-0">
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-800/50 overflow-hidden">
              <div style={{ height: 'calc(100vh - 220px)' }}>
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
          </TabsContent>

          {/* Tab Content: WhatsApp */}
          <TabsContent value="whatsapp" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Card */}
              <Card className="border-0 shadow-xl bg-white dark:bg-gray-800/50 overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <QrCode className="w-5 h-5 text-emerald-500" />
                    Código QR
                  </CardTitle>
                  <CardDescription>Escaneá el código con WhatsApp</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <QRCodeDisplay qrCode={session?.qrCode || null} status={session?.status || 'disconnected'} />
                </CardContent>
              </Card>

              {/* Control Card */}
              <Card className="border-0 shadow-xl bg-white dark:bg-gray-800/50 overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-emerald-500" />
                    Control de Sesión
                  </CardTitle>
                  <CardDescription>Gestiona la conexión de WhatsApp</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Estado de conexión */}
                  {session?.connectedAt && session?.status === 'connected' && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200 dark:border-emerald-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                        <div>
                          <p className="font-medium text-emerald-800 dark:text-emerald-200">
                            Conectado {session.phone ? `(${session.phone})` : ''}
                          </p>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            Desde {new Date(session.connectedAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {wsError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                      <p className="text-sm text-red-600 dark:text-red-400">{wsError}</p>
                    </div>
                  )}

                  {/* Acciones principales */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </p>
                    <div className="grid grid-cols-2 gap-3">
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

                  {/* Acciones avanzadas */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Opciones Avanzadas
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
                        onClick={handleDeleteSession}
                        loading={actionLoading === 'delete'}
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
            </div>
          </TabsContent>

          {/* Tab Content: Config IA */}
          <TabsContent value="config" className="mt-0">
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-800/50 overflow-hidden" style={{ minHeight: '600px' }}>
              <PromptEditor
                config={promptConfig}
                loading={promptLoading}
                onSave={handleSavePromptConfig}
                onReload={fetchPromptConfig}
              />
            </Card>
          </TabsContent>

          {/* Tab Content: Users */}
          <TabsContent value="users" className="mt-0">
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-800/50 overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  Usuarios del Sistema
                </CardTitle>
                <CardDescription>Administrá los usuarios y permisos. Cambiá el rol a "admin" para otorgar acceso completo.</CardDescription>
              </CardHeader>
              <div style={{ height: 'calc(100vh - 320px)' }}>
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
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-4 mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Panel de Control - Automatización WhatsApp con IA</span>
          </div>
          <div className="hidden sm:block">
            delegar.space
          </div>
        </div>
      </footer>
    </div>
  );
}
