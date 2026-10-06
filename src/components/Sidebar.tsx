import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HardHat,
  LayoutDashboard,
  FileText,
  Building2,
  Building,
  Users,
  FolderOpen,
  Shield,
  Settings,
  LogOut,
  Mic,
  PlusCircle,
  X,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenVoiceModal: () => void;
  onOpenNewRdo: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenVoiceModal,
  onOpenNewRdo,
  isOpen,
  onClose,
}) => {
  const { user, profile, role, isEditor, logout } = useAuth();
  const { obras, selectedObraId, setSelectedObraId, selectedObra } = useData();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rdos', label: 'RDOs', icon: FileText },
    { id: 'obras', label: 'Obras', icon: Building2 },
    { id: 'empresas', label: 'Empresas', icon: Building },
    { id: 'equipe', label: 'Equipe', icon: Users },
    { id: 'documentos', label: 'Documentos', icon: FolderOpen },
    { id: 'usuarios', label: 'Usuários', icon: Shield },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Permanent Left Vertical Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 sm:w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="flex flex-col shrink-0">
          <div className="h-14 px-4 sm:px-5 border-b border-slate-800 flex items-center justify-between">
            <div
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-700 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <HardHat className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                  RDO <span className="text-blue-400">Inteligente</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Gestão de Canteiro</span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Obra Selecionada (Selector Panel) */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Obra Selecionada:
            </label>
            <div className="relative">
              <select
                value={selectedObraId}
                onChange={(e) => setSelectedObraId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer truncate"
              >
                {obras.length > 0 ? (
                  obras.map((o) => (
                    <option key={o.id} value={o.id} className="bg-slate-900 text-slate-100 py-1">
                      {o.codigo} - {o.nome}
                    </option>
                  ))
                ) : (
                  <option value="" disabled className="bg-slate-900 text-slate-400">
                    Nenhuma obra cadastrada
                  </option>
                )}
              </select>
            </div>
            {selectedObra && (
              <p className="text-[10px] text-blue-400 mt-1 truncate">
                {selectedObra.cliente || 'Contrato ativo'}
              </p>
            )}
          </div>

          {/* Quick Actions for Editor */}
          {isEditor && (
            <div className="p-2.5 space-y-1.5 border-b border-slate-800/80 bg-slate-900/40">
              <button
                type="button"
                onClick={() => {
                  onOpenVoiceModal();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/30 transition-all active:scale-95"
              >
                <Mic className="w-3.5 h-3.5 shrink-0" />
                <span>Gravar RDO com IA</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenNewRdo();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-950/30 transition-all active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Novo RDO</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items (Fluid, zero scrollbar bar) */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-2 px-2.5 space-y-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: User Profile & Sair da Conta */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2 shrink-0">
          {/* User info */}
          <div className="px-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-blue-300 font-bold text-xs uppercase shrink-0">
                {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-100 truncate leading-tight">
                  {profile?.displayName || user?.displayName || user?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      role === 'Editor' ? 'bg-blue-900/80 text-blue-300' : 'bg-amber-900/80 text-amber-300'
                    }`}
                  >
                    {role}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Theme Toggle Button in Sidebar */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
              title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          </div>

          {/* Sair da Conta button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-red-400 bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>
    </>
  );
};
