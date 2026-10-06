import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { RdoList } from './components/RdoList';
import { RdoForm } from './components/RdoForm';
import { RdoViewModal } from './components/RdoViewModal';
import { VoiceRdoModal } from './components/VoiceRdoModal';
import { ObrasManager } from './components/ObrasManager';
import { EmpresasManager } from './components/EmpresasManager';
import { EquipeManager } from './components/EquipeManager';
import { DocumentosManager } from './components/DocumentosManager';
import { UsuariosManager } from './components/UsuariosManager';
import { Configuracoes } from './components/Configuracoes';
import { HardHat } from 'lucide-react';
import type { RDO, StructuredAiExtraction } from './types';

const MainApp: React.FC = () => {
  const { user, loading, role, isEditor } = useAuth();
  const { obras, selectedObra, empresas } = useData();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal states
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [rdoFormOpen, setRdoFormOpen] = useState(false);
  const [editingRdo, setEditingRdo] = useState<RDO | undefined>(undefined);
  const [viewingRdo, setViewingRdo] = useState<RDO | null>(null);
  const [pendingAiExtraction, setPendingAiExtraction] = useState<StructuredAiExtraction | null>(null);

  // 1. Loading screen (preventing any flicker of internal data)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <HardHat className="w-6 h-6 text-amber-400 absolute" />
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Carregando RDO Inteligente...
        </p>
      </div>
    );
  }

  // 2. Strict Unauthenticated Boundary: If no user, show Landing Page only!
  if (!user) {
    return <LandingPage />;
  }

  // Handlers
  const handleOpenNewRdo = () => {
    setEditingRdo(undefined);
    setRdoFormOpen(true);
  };

  const handleEditRdo = (rdo: RDO) => {
    setEditingRdo(rdo);
    setRdoFormOpen(true);
  };

  const handleViewRdo = (rdo: RDO) => {
    setViewingRdo(rdo);
  };

  const handleApplyAiExtraction = (data: StructuredAiExtraction) => {
    setPendingAiExtraction(data);
    setRdoFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-blue-600 selection:text-white">
      {/* Left Vertical Sidebar (Permanent on Desktop, Drawer on Mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        onOpenNewRdo={handleOpenNewRdo}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by Sidebar on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 sm:lg:pl-72">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenVoiceModal={() => setVoiceModalOpen(true)}
          onOpenNewRdo={handleOpenNewRdo}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* If RDO form is open, prioritize it */}
          {rdoFormOpen ? (
            <RdoForm
              initialRdo={editingRdo}
              onClose={() => {
                setRdoFormOpen(false);
                setEditingRdo(undefined);
              }}
              onOpenVoiceModal={() => setVoiceModalOpen(true)}
              pendingAiExtraction={pendingAiExtraction}
              onClearAiExtraction={() => setPendingAiExtraction(null)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  onOpenVoiceModal={() => setVoiceModalOpen(true)}
                  onOpenNewRdo={handleOpenNewRdo}
                  onEditRdo={handleEditRdo}
                  onViewRdo={handleViewRdo}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'rdos' && (
                <RdoList
                  onOpenVoiceModal={() => setVoiceModalOpen(true)}
                  onOpenNewRdo={handleOpenNewRdo}
                  onEditRdo={handleEditRdo}
                  onViewRdo={handleViewRdo}
                />
              )}

              {activeTab === 'obras' && <ObrasManager />}

              {activeTab === 'empresas' && <EmpresasManager />}

              {activeTab === 'equipe' && <EquipeManager />}

              {activeTab === 'documentos' && <DocumentosManager />}

              {activeTab === 'usuarios' && <UsuariosManager />}

              {activeTab === 'configuracoes' && <Configuracoes />}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-[11px] text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>RDO Inteligente • Sistema de Diário de Obra com IA</span>
            <span>Ambiente Autenticado • Perfil: {role}</span>
          </div>
        </footer>
      </div>

      {/* Voice e AI Extraction Modal */}
      <VoiceRdoModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onApplyExtraction={handleApplyAiExtraction}
      />

      {/* RDO Detail View Modal */}
      <RdoViewModal
        rdo={viewingRdo}
        obra={obras.find((o) => o.id === viewingRdo?.obraId)}
        empresa={empresas[0]}
        onClose={() => setViewingRdo(null)}
        onEdit={handleEditRdo}
        isEditor={isEditor}
      />
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled app error in ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <HardHat className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Ops, ocorreu um imprevisto</h2>
            <p className="text-xs text-slate-400">
              O sistema encontrou uma instabilidade temporária ao carregar a interface.
            </p>
            {this.state.error?.message && (
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300 font-mono text-left overflow-x-auto whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-950/40"
              >
                Recarregar Sistema
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <MainApp />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
