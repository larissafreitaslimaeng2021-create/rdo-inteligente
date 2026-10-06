import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  Settings,
  Database,
  Cloud,
  Cpu,
  Sparkles,
  CheckCircle2,
  HardHat,
  Shield,
  User,
  Info,
} from 'lucide-react';

export const Configuracoes: React.FC = () => {
  const { user, profile, role } = useAuth();
  const { loadDemoData, obras, rdos } = useData();

  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    try {
      await loadDemoData();
      setDemoLoaded(true);
      setTimeout(() => setDemoLoaded(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Configurações e Integrações</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Parâmetros do sistema, status dos serviços em nuvem e dados de teste
        </p>
      </div>

      {/* User Session Profile Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <span>Sessão do Usuário Conectado</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Nome</span>
            <span className="text-slate-100 font-semibold">{profile?.displayName || 'Não informado'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">E-mail</span>
            <span className="text-slate-100 font-semibold">{user?.email}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Perfil de Acesso</span>
            <span className="text-blue-400 font-bold uppercase">{role}</span>
          </div>
        </div>
      </div>

      {/* Architecture & Cloud Services Status */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Status dos Serviços Conectados</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Firebase Firestore</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400">Banco de dados em tempo real ativo</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Google Gemini IA</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400">Modelo gemini-3.8-flash ativo para áudio e texto</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Google Drive Sync</span>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            </div>
            <p className="text-[11px] text-slate-400">Pastas de obras e exportação prontas</p>
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Dados de Demonstração para Testes de Engenharia</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Gera automaticamente uma obra completa (Edifício Solar das Palmeiras), construtora, equipe técnica e RDOs ilustrativos com fotos, mão de obra, paralisação por chuva e segurança, devidamente rotulados com a tag obrigatória <code>[DADOS DE DEMONSTRAÇÃO]</code>.
            </p>
          </div>

          <button
            type="button"
            disabled={loadingDemo}
            onClick={handleLoadDemo}
            className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/30 shrink-0 transition-all disabled:opacity-50"
          >
            {loadingDemo ? 'Carregando...' : 'Carregar Dados de Demonstração'}
          </button>
        </div>

        {demoLoaded && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dados de demonstração inseridos com sucesso! Navegue pelo Dashboard ou Obras para conferir.</span>
          </div>
        )}
      </div>
    </div>
  );
};
