import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  FileText,
  PlusCircle,
  Mic,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  Building,
  CheckCircle,
  Clock,
} from 'lucide-react';
import type { RDO } from '../types';
import { generateRdoPdf } from '../lib/pdfGenerator';

interface RdoListProps {
  onOpenVoiceModal: () => void;
  onOpenNewRdo: () => void;
  onEditRdo: (rdo: RDO) => void;
  onViewRdo: (rdo: RDO) => void;
}

export const RdoList: React.FC<RdoListProps> = ({
  onOpenVoiceModal,
  onOpenNewRdo,
  onEditRdo,
  onViewRdo,
}) => {
  const { isEditor } = useAuth();
  const { rdos, obras, selectedObraId, deleteRdo, empresas } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Finalizado' | 'Rascunho'>('ALL');
  const [obraFilter, setObraFilter] = useState<string>(selectedObraId || 'ALL');

  // Filtered RDOs
  const filteredRdos = rdos.filter((r) => {
    const matchesObra = obraFilter === 'ALL' || r.obraId === obraFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      r.numero.toString().includes(searchTerm) ||
      r.data.includes(searchTerm) ||
      r.obraNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.atividadesExecutadas.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesObra && matchesStatus && matchesSearch;
  });

  const handleDownloadPdf = async (rdo: RDO) => {
    const obraItem = obras.find((o) => o.id === rdo.obraId);
    const empresaItem = empresas.find((e) => e.id === obraItem?.companyId) || empresas[0];
    const pdfDoc = await generateRdoPdf(rdo, obraItem, empresaItem);
    pdfDoc.save(`RDO_${String(rdo.numero).padStart(3, '0')}_${rdo.data.replace(/\//g, '-')}.pdf`);
  };

  const handleDelete = async (rdo: RDO) => {
    if (!window.confirm(`Tem certeza que deseja excluir o RDO Nº ${rdo.numero}?`)) return;
    try {
      await deleteRdo(rdo.id);
    } catch (err) {
      console.error('Erro ao excluir RDO:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Relatórios Diários de Obra (RDOs)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Histórico completo de diários de obra registrados no sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditor && (
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition-all"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Gravar com IA</span>
            </button>
          )}

          {isEditor && (
            <button
              type="button"
              onClick={onOpenNewRdo}
              className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo RDO</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número, data, serviços..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Obra Filter */}
          <select
            value={obraFilter}
            onChange={(e) => setObraFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todas as Obras</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.codigo} - {o.nome}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="Finalizado">Somente Finalizados</option>
            <option value="Rascunho">Somente Rascunhos</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredRdos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Nenhum RDO encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Nº RDO</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Obra</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Avanço</th>
                  <th className="px-4 py-3">Efetivo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRdos.map((rdo) => {
                  const totalEfetivo = rdo.maoDeObra?.reduce((sum, item) => sum + (Number(item.quantidade) || 0), 0) || 0;
                  return (
                    <tr key={rdo.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-white">
                        Nº {String(rdo.numero).padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                        {rdo.data}
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px] truncate text-slate-200">
                        {rdo.obraNome}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-400">
                        {rdo.responsavel}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-emerald-400 font-bold">
                        {rdo.percentualAvanco !== undefined ? `${rdo.percentualAvanco}%` : '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-blue-400 text-[11px] font-semibold">
                          {totalEfetivo} pess.
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

                          {isEditor && (
                            <button
                              type="button"
                              onClick={() => handleDelete(rdo)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                              title="Excluir RDO"
                            >
                              <Trash2 className="w-4 h-4" />
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
    </div>
  );
};
