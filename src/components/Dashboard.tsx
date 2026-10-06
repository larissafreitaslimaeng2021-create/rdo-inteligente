import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  HardHat,
  Building2,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Mic,
  Download,
  Eye,
  Edit,
  FolderOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Cloud,
  Loader2,
  Check,
} from 'lucide-react';
import type { RDO } from '../types';
import { generateRdoPdf } from '../lib/pdfGenerator';
import { resolveDriveUrl, createRealDriveFolder } from '../lib/googleDrive';

interface DashboardProps {
  onOpenVoiceModal: () => void;
  onOpenNewRdo: () => void;
  onEditRdo: (rdo: RDO) => void;
  onViewRdo: (rdo: RDO) => void;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenVoiceModal,
  onOpenNewRdo,
  onEditRdo,
  onViewRdo,
  setActiveTab,
}) => {
  const { user, isEditor, getGoogleDriveToken } = useAuth();
  const { obras, selectedObraId, selectedObra, rdos, empresas, loadDemoData, saveObra } = useData();

  const [creatingDriveFolder, setCreatingDriveFolder] = React.useState(false);
  const [driveSuccessMsg, setDriveSuccessMsg] = React.useState('');
  const [driveErrMsg, setDriveErrMsg] = React.useState('');

  const handleCreateDriveFolder = async () => {
    if (!selectedObra) return;
    setCreatingDriveFolder(true);
    setDriveSuccessMsg('');
    setDriveErrMsg('');

    try {
      const token = await getGoogleDriveToken();
      if (!token) {
        setDriveErrMsg('Para criar pastas no Google Drive, aprove o acesso na janela de login do Google.');
        setCreatingDriveFolder(false);
        return;
      }

      const result = await createRealDriveFolder(token, selectedObra.codigo, selectedObra.nome);
      await saveObra({
        id: selectedObra.id,
        codigo: selectedObra.codigo,
        nome: selectedObra.nome,
        googleDriveUrl: result.folderUrl,
        googleDriveFolderId: result.folderId,
      });

      setDriveSuccessMsg('Pastas criadas no Google Drive com sucesso!');
      // Open the newly created folder in user's Drive!
      window.open(result.folderUrl, '_blank');
    } catch (err: any) {
      console.error('Erro ao criar pasta no Google Drive:', err);
      setDriveErrMsg(err?.message || 'Erro ao conectar ao Google Drive.');
    } finally {
      setCreatingDriveFolder(false);
    }
  };

  // Filter RDOs for current selected obra or global
  const activeRdos = selectedObraId ? rdos.filter((r) => r.obraId === selectedObraId) : rdos;

  const totalObras = obras.length;
  const obrasAtivas = obras.filter((o) => o.status === 'Em Andamento').length;
  const rdosEmitidos = activeRdos.filter((r) => r.status === 'Finalizado').length;
  const rdosPendentes = activeRdos.filter((r) => r.status === 'Rascunho').length;

  const avgProgress =
    obras.length > 0 ? (obras.reduce((acc, o) => acc + (o.percentualAvanco || 0), 0) / obras.length).toFixed(1) : '0';

  // Recent occurrences across RDOs
  const recentOcorrencias = activeRdos
    .filter((r) => r.ocorrencias && r.ocorrencias.trim().length > 0)
    .slice(0, 3);

  // Latest RDOs
  const latestRdos = activeRdos.slice(0, 6);

  const handleDownloadPdf = async (rdo: RDO) => {
    const obraItem = obras.find((o) => o.id === rdo.obraId);
    const empresaItem = empresas.find((e) => e.id === obraItem?.companyId) || empresas[0];
    const pdfDoc = await generateRdoPdf(rdo, obraItem, empresaItem);
    pdfDoc.save(`RDO_${String(rdo.numero).padStart(3, '0')}_${rdo.data.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner e Action Shortcuts */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>
                Obra Atual: <strong>{selectedObra ? `${selectedObra.codigo} - ${selectedObra.nome}` : 'Todas as Obras'}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Painel de Controle Diário da Obra
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Acompanhamento de relatórios diários, avanço físico, contingente operacional e registros fotográficos de campo.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isEditor && (
              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>Gravar RDO por Voz</span>
              </button>
            )}

            {isEditor && (
              <button
                type="button"
                onClick={onOpenNewRdo}
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-950/30 flex items-center gap-2 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Novo RDO</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtle decorative background icon */}
        <HardHat className="absolute -right-6 -bottom-8 w-44 h-44 text-slate-800/20 pointer-events-none" />
      </div>

      {/* Demo Data Banner if empty */}
      {obras.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-200">Banco de dados inicial sem registros</p>
              <p className="text-[11px] text-amber-300/80">
                Você pode criar uma nova obra ou carregar dados de teste rotulados explicitamente como [DADOS DE DEMONSTRAÇÃO].
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadDemoData}
            className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-all"
          >
            Carregar Dados de Demonstração
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Obras Ativas */}
        <div
          onClick={() => setActiveTab('obras')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">Obras Ativas</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{obrasAtivas}</p>
          <p className="text-[10px] text-slate-500 mt-1">{totalObras} obras cadastradas no total</p>
        </div>

        {/* RDOs Emitidos (Finalizados) */}
        <div
          onClick={() => setActiveTab('rdos')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">RDOs Emitidos</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{rdosEmitidos}</p>
          <p className="text-[10px] text-slate-500 mt-1">Relatórios oficiais validados</p>
        </div>

        {/* RDOs Pendentes (Rascunhos) */}
        <div
          onClick={() => setActiveTab('rdos')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">RDOs Pendentes</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400">{rdosPendentes}</p>
          <p className="text-[10px] text-slate-500 mt-1">Rascunhos em preenchimento</p>
        </div>

        {/* Avanço Físico Médio */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">Avanço Físico Médio</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{avgProgress}%</p>
          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full"
              style={{ width: `${Math.min(100, Number(avgProgress))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Recent Ocorrências banner */}
      {recentOcorrencias.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Ocorrências Recentes de Campo</span>
            </h3>
            <span className="text-[10px] text-slate-400">Alertas registrados em RDO</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentOcorrencias.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-300">RDO Nº {String(item.numero).padStart(3, '0')}</span>
                  <span className="text-slate-500">{item.data}</span>
                </div>
                <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">{item.ocorrencias}</p>
                <p className="text-[10px] text-slate-500">Resp: {item.responsavel}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Últimos RDOs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Últimos Relatórios Diários de Obra</h3>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('rdos')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Ver todos ({activeRdos.length})
          </button>
        </div>

        {latestRdos.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Nenhum RDO emitido para a obra selecionada.</p>
            {isEditor && (
              <button
                type="button"
                onClick={onOpenNewRdo}
                className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Criar Primeiro RDO
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Nº / Data</th>
                  <th className="px-4 py-3">Obra</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Clima</th>
                  <th className="px-4 py-3">Efetivo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {latestRdos.map((rdo) => {
                  const totalTrabalhadores = rdo.maoDeObra?.reduce((sum, m) => sum + (Number(m.quantidade) || 0), 0) || 0;
                  return (
                    <tr key={rdo.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-white block">RDO Nº {String(rdo.numero).padStart(3, '0')}</span>
                        <span className="text-[10px] text-slate-500">{rdo.data}</span>
                      </td>

                      <td className="px-4 py-3.5 max-w-[180px] truncate text-slate-300">
                        {rdo.obraNome}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-400">
                        {rdo.responsavel}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                        <span className="text-[11px] font-medium">M: {rdo.condicoesClimaticas?.manha || 'Bom'}</span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-blue-400 font-bold text-[11px]">
                          {totalTrabalhadores} pess.
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            rdo.status === 'Finalizado'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/80'
                          }`}
                        >
                          {rdo.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(rdo)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            title="Baixar PDF Oficial"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewRdo(rdo)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Visualizar Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isEditor && (
                            <button
                              type="button"
                              onClick={() => onEditRdo(rdo)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                              title="Editar RDO"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 4: Obra Overview with Google Drive Link */}
      {selectedObra && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Repositório na Nuvem da Obra
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {selectedObra.codigo} - {selectedObra.nome}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Pastas organizadas: <code>/RDOs</code> • <code>/Fotos</code> • <code>/Documentos</code>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Button to Create Folder in Google Drive via API */}
              {isEditor && (
                <button
                  type="button"
                  disabled={creatingDriveFolder}
                  onClick={handleCreateDriveFolder}
                  className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-950/30 disabled:opacity-60 shrink-0"
                  title="Criar a pasta da obra e as subpastas automaticamente no seu Google Drive"
                >
                  {creatingDriveFolder ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  <span>{creatingDriveFolder ? 'Criando no Drive...' : 'Criar Pasta no Drive'}</span>
                </button>
              )}

              {/* Safe Open Drive link */}
              <a
                href={resolveDriveUrl(selectedObra.googleDriveUrl, selectedObra.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all shrink-0"
                title="Abrir pasta no Google Drive"
              >
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <span>Abrir Pasta no Google Drive</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Feedback messages */}
          {driveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{driveSuccessMsg}</span>
            </div>
          )}

          {driveErrMsg && (
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{driveErrMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
