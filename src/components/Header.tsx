import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HardHat,
  LogOut,
  Building,
  User,
  Shield,
  ChevronDown,
  PlusCircle,
  Mic,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenVoiceModal: () => void;
  onOpenNewRdo: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenVoiceModal,
  onOpenNewRdo,
  activeTab,
  setActiveTab,
}) => {
  const { user, profile, role, isEditor, logout } = useAuth();
  const { obras, selectedObraId, setSelectedObraId, selectedObra } = useData();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  const titles: Record<string, string> = {
    dashboard: 'Painel de Controle',
    rdos: 'Relatórios Diários de Obra (RDO)',
    obras: 'Gestão de Obras e Empreendimentos',
    empresas: 'Empresas e Construtoras',
    equipe: 'Equipe Técnica do Canteiro',
    documentos: 'Documentos e Google Drive',
    usuarios: 'Gestão de Usuários (RBAC)',
    configuracoes: 'Configurações e Integrações',
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left Side: Mobile Sidebar Trigger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all"
            title="Abrir Menu de Navegação"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
              {titles[activeTab] || 'RDO Inteligente'}
            </h2>
            {selectedObra && (
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Obra ativa: <strong className="text-blue-400 font-medium">{selectedObra.codigo} - {selectedObra.nome}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Buttons & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gravar RDO com IA */}
          {isEditor && (
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all active:scale-95"
              title="Gravar relato de campo por voz com inteligência artificial"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gravar com IA</span>
              <span className="sm:hidden">IA</span>
            </button>
          )}

          {/* Novo RDO */}
          {isEditor && (
            <button
              type="button"
              onClick={onOpenNewRdo}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-950/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo RDO</span>
              <span className="sm:hidden">Novo</span>
            </button>
          )}

          {/* Theme Toggle (Claro / Escuro) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800 transition-all text-slate-300 hover:text-white flex items-center justify-center shrink-0"
            title={theme === 'light' ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro (Visualização Aumentada)'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User Profile & Logout Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-xl hover:bg-slate-800 transition-all border border-slate-800/80"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-blue-300 font-bold text-xs uppercase">
                {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                  {profile?.displayName || user?.displayName || user?.email?.split('@')[0]}
                </p>
                <span
                  className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    role === 'Editor' ? 'bg-blue-900/80 text-blue-300' : 'bg-amber-900/80 text-amber-300'
                  }`}
                >
                  {role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-semibold text-slate-100 truncate">{profile?.displayName || 'Usuário'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <p className="text-[10px] text-blue-400 mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Perfil: {role}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('configuracoes');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-300 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" /> Meu Perfil e Configurações
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-950/40 text-red-400 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sair da Conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
