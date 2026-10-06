import React from 'react';
import {
  X,
  Download,
  Calendar,
  Building,
  User,
  CloudSun,
  HardHat,
  Truck,
  Package,
  AlertTriangle,
  Shield,
  FileCheck,
  Camera,
  CheckCircle2,
  Layers,
  Compass,
  MapPin,
  ListTodo,
} from 'lucide-react';
import type { RDO, Obra, Empresa } from '../types';
import { generateRdoPdf } from '../lib/pdfGenerator';

interface RdoViewModalProps {
  rdo: RDO | null;
  obra?: Obra;
  empresa?: Empresa;
  onClose: () => void;
  onEdit?: (rdo: RDO) => void;
  isEditor?: boolean;
}

export const RdoViewModal: React.FC<RdoViewModalProps> = ({
  rdo,
  obra,
  empresa,
  onClose,
  onEdit,
  isEditor,
}) => {
  if (!rdo) return null;

  const handleDownload = async () => {
    const pdfDoc = await generateRdoPdf(rdo, obra, empresa);
    pdfDoc.save(`RDO_${String(rdo.numero).padStart(3, '0')}_${rdo.data.replace(/\//g, '-')}.pdf`);
  };

  const totalTrabalhadores = rdo.maoDeObra?.reduce((sum, item) => sum + (Number(item.quantidade) || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 font-bold text-sm">
              Nº {String(rdo.numero).padStart(3, '0')}
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Relatório Diário de Obra • {rdo.data}
              </h3>
              <p className="text-xs text-slate-400">{rdo.obraNome}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-950/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>

            {isEditor && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(rdo);
                }}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
              >
                Editar
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  rdo.status === 'Finalizado'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {rdo.status}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Responsável Técnico</span>
              <span className="text-slate-200 font-semibold">{rdo.responsavel}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Avanço Físico</span>
              <span className="text-emerald-400 font-bold">{rdo.percentualAvanco || 0}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Efetivo de Campo</span>
              <span className="text-blue-400 font-bold">{totalTrabalhadores} pessoas</span>
            </div>
          </div>

          {/* Clima */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Condições Climáticas
            </span>
            <div className="flex flex-wrap gap-4 text-slate-200">
              <span>
                <strong>Manhã:</strong> {rdo.condicoesClimaticas?.manha || 'Bom'}
              </span>
              <span>
                <strong>Tarde:</strong> {rdo.condicoesClimaticas?.tarde || 'Bom'}
              </span>
              <span>
                <strong>Noite:</strong> {rdo.condicoesClimaticas?.noite || 'Bom'}
              </span>
            </div>
          </div>

          {/* Etapas, Frentes e Local */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Etapa, Frente de Serviço e Localização
            </span>
            <div className="flex flex-wrap gap-2">
              {rdo.etapa && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-800/80 text-blue-300 text-xs font-semibold">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Etapa: {rdo.etapa}</span>
                </span>
              )}
              {rdo.frenteServico && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-800/80 text-amber-300 text-xs font-semibold">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Frente: {rdo.frenteServico}</span>
                </span>
              )}
              {rdo.local && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Local: {rdo.local}</span>
                </span>
              )}
              {!rdo.etapa && !rdo.frenteServico && rdo.etapasFrentes && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs">
                  <span>{rdo.etapasFrentes}</span>
                </span>
              )}
            </div>
          </div>

          {/* Atividades Executadas (Checklist & Texto) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Atividades e Serviços Realizados
              </span>
              {rdo.atividadesChecklist && rdo.atividadesChecklist.length > 0 && (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {rdo.atividadesChecklist.filter((i) => i.concluida || i.status === 'Concluído').length} de{' '}
                  {rdo.atividadesChecklist.length} concluídas
                </span>
              )}
            </div>

            {/* Checklist items if available */}
            {rdo.atividadesChecklist && rdo.atividadesChecklist.length > 0 ? (
              <div className="space-y-1.5">
                {rdo.atividadesChecklist.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          item.concluida || item.status === 'Concluído'
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'border border-slate-600 bg-slate-800'
                        }`}
                      >
                        {(item.concluida || item.status === 'Concluído') && '✓'}
                      </span>
                      <span
                        className={`truncate ${
                          item.concluida || item.status === 'Concluído'
                            ? 'line-through text-slate-400'
                            : 'text-slate-100 font-medium'
                        }`}
                      >
                        {item.descricao}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.local && (
                        <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {item.local}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          item.status === 'Concluído' || item.concluida
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : item.status === 'Em Andamento'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : item.status === 'Iniciado'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.status || (item.concluida ? 'Concluído' : 'Em Andamento')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {rdo.atividadesExecutadas || 'Nenhuma atividade registrada.'}
              </p>
            )}

            {/* Narrative text note if both exist */}
            {rdo.atividadesChecklist && rdo.atividadesChecklist.length > 0 && rdo.atividadesExecutadas && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 block mb-1">Relato Descritivo Complementar:</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  {rdo.atividadesExecutadas}
                </p>
              </div>
            )}
          </div>

          {/* Mão de Obra */}
          {rdo.maoDeObra && rdo.maoDeObra.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Mão de Obra e Efetivo ({rdo.maoDeObra.length} funções)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {rdo.maoDeObra.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <p className="font-semibold text-slate-100">{item.funcao}</p>
                    <p className="text-blue-400 font-bold">{item.quantidade} colaboradores</p>
                    {item.empresa && <p className="text-[10px] text-slate-500">{item.empresa}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equipamentos & Materiais Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Equipamentos */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Equipamentos ({rdo.equipamentos?.length || 0})
              </span>
              {rdo.equipamentos && rdo.equipamentos.length > 0 ? (
                <div className="space-y-1.5">
                  {rdo.equipamentos.map((eq, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]"
                    >
                      <span className="text-slate-200 font-medium">{eq.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-400">{eq.quantidade}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px]">
                          {eq.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic text-[11px]">Nenhum equipamento listado.</p>
              )}
            </div>

            {/* Materiais */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Materiais ({rdo.materiais?.length || 0})
              </span>
              {rdo.materiais && rdo.materiais.length > 0 ? (
                <div className="space-y-1.5">
                  {rdo.materiais.map((mat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]"
                    >
                      <span className="text-slate-200 font-medium">{mat.descricao}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">{mat.quantidade}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            mat.tipo === 'Recebido' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'
                          }`}
                        >
                          {mat.tipo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic text-[11px]">Nenhum material listado.</p>
              )}
            </div>
          </div>

          {/* Ocorrências e Segurança */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ocorrências e Imprevistos
              </span>
              <p className="text-slate-300 leading-relaxed">
                {rdo.ocorrencias || 'Sem ocorrências registradas no dia.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Segurança do Trabalho
              </span>
              <p className="text-slate-300 leading-relaxed">
                {rdo.seguranca || 'DDS realizado. Zero acidentes.'}
              </p>
            </div>
          </div>

          {/* Relatório Fotográfico */}
          {rdo.fotos && rdo.fotos.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Relatório Fotográfico ({rdo.fotos.length} fotos)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rdo.fotos.map((foto) => (
                  <div key={foto.id} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                    <img src={foto.url} alt={foto.legenda} className="w-full h-36 object-cover" />
                    <div className="p-2.5 space-y-1">
                      <p className="text-slate-200 font-medium text-[11px]">{foto.legenda}</p>
                      <span className="text-[10px] text-slate-500 block">{foto.dataHora}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
