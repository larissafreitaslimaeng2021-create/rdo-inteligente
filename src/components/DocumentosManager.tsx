import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  FolderOpen,
  FileText,
  Upload,
  Download,
  Trash2,
  Filter,
  ExternalLink,
  Image as ImageIcon,
  FileCheck,
  Building,
  Plus,
  X,
  Cloud,
  Link as LinkIcon,
  Check,
  Loader2,
} from 'lucide-react';
import type { DocumentoItem, DocumentoTipo } from '../types';
import { resolveDriveUrl, createRealDriveFolder } from '../lib/googleDrive';

export const DocumentosManager: React.FC = () => {
  const { user, isEditor, getGoogleDriveToken } = useAuth();
  const { documentos, obras, selectedObraId, selectedObra, saveDocumento, deleteDocumento, saveObra } = useData();

  const [obraFilter, setObraFilter] = useState<string>(selectedObraId || 'ALL');
  const [tipoFilter, setTipoFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [driveConfigOpen, setDriveConfigOpen] = useState(false);
  const [customDriveInput, setCustomDriveInput] = useState(selectedObra?.googleDriveUrl || '');
  const [savedDriveSuccess, setSavedDriveSuccess] = useState(false);
  const [creatingDriveFolder, setCreatingDriveFolder] = useState(false);
  const [driveMsg, setDriveMsg] = useState('');

  const handleCreateFolder = async () => {
    if (!selectedObra) return;
    setCreatingDriveFolder(true);
    setDriveMsg('');

    try {
      const token = await getGoogleDriveToken();
      if (!token) {
        setDriveMsg('Acesso ao Google Drive necessário. Conceda a permissão na janela do Google.');
        setCreatingDriveFolder(false);
        return;
      }

      const res = await createRealDriveFolder(token, selectedObra.codigo, selectedObra.nome);
      await saveObra({
        id: selectedObra.id,
        codigo: selectedObra.codigo,
        nome: selectedObra.nome,
        googleDriveUrl: res.folderUrl,
        googleDriveFolderId: res.folderId,
      });

      setDriveMsg('Pasta criada com sucesso no Google Drive!');
      window.open(res.folderUrl, '_blank');
    } catch (err: any) {
      console.error(err);
      setDriveMsg(err?.message || 'Erro ao criar pasta no Google Drive.');
    } finally {
      setCreatingDriveFolder(false);
    }
  };

  // Form states
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<DocumentoTipo>('RDO_PDF');
  const [obraId, setObraId] = useState(selectedObraId || (obras[0]?.id ?? ''));

  const filteredDocs = documentos.filter((d) => {
    const matchesObra = obraFilter === 'ALL' || d.obraId === obraFilter;
    const matchesTipo = tipoFilter === 'ALL' || d.tipo === tipoFilter;
    return matchesObra && matchesTipo;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await saveDocumento({
          obraId: obraFilter !== 'ALL' ? obraFilter : (obras[0]?.id ?? ''),
          titulo: file.name,
          tipo: file.type.includes('pdf') ? 'RDO_PDF' : file.type.includes('image') ? 'FOTO' : 'OUTRO',
          arquivoUrl: reader.result as string,
          tamanho: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          dataUpload: new Date().toLocaleDateString('pt-BR'),
          criadoPor: user?.displayName || 'Engenheiro',
        });
      } catch (err) {
        console.error('Erro ao enviar documento:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let finalObraId = obraId;
      if (!finalObraId && obras.length > 0) {
        finalObraId = obras[0].id;
      }

      await saveDocumento({
        obraId: finalObraId || 'obra_geral',
        titulo: titulo.trim(),
        tipo,
        arquivoUrl: '#',
        tamanho: '1.4 MB',
        dataUpload: new Date().toLocaleDateString('pt-BR'),
        criadoPor: user?.displayName || 'Engenheiro',
      });
      setModalOpen(false);
      setTitulo('');
    } catch (err) {
      console.error('Erro ao cadastrar documento:', err);
    }
  };

  const handleDelete = async (docItem: DocumentoItem) => {
    try {
      await deleteDocumento(docItem.id);
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <span>Repositório de Documentos da Obra</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            PDFs de RDOs finalizados, relatórios fotográficos, projetos e sincronização com Google Drive
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditor && (
            <label className="cursor-pointer py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Fazer Upload de Arquivo</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          )}

          {selectedObra && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {isEditor && (
                <button
                  type="button"
                  disabled={creatingDriveFolder}
                  onClick={handleCreateFolder}
                  className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all disabled:opacity-60"
                  title="Criar a pasta e subpastas da obra automaticamente no Google Drive"
                >
                  {creatingDriveFolder ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Cloud className="w-3.5 h-3.5" />
                  )}
                  <span>{creatingDriveFolder ? 'Criando...' : 'Criar Pasta no Drive'}</span>
                </button>
              )}

              <a
                href={resolveDriveUrl(selectedObra.googleDriveUrl, selectedObra.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all shadow-xs"
                title="Abrir pasta no Google Drive"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Abrir no Drive</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              {isEditor && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomDriveInput(selectedObra.googleDriveUrl || '');
                    setDriveConfigOpen(true);
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
                  title="Configurar Link da Pasta do Google Drive"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {driveMsg && (
        <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-300 text-xs flex items-center justify-between gap-2">
          <span>{driveMsg}</span>
          <button type="button" onClick={() => setDriveMsg('')} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Google Drive automatic folder structure banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 text-xs">
        <h4 className="font-bold text-white flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-400" />
          <span>Estrutura de Pastas Sincronizada no Google Drive</span>
        </h4>
        <p className="text-slate-400 mt-1">
          Cada obra cadastrada possui organização automática em três subpastas estratégicas de canteiro:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 font-mono text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300">
            <span className="p-1 rounded bg-blue-500/10 text-blue-400 font-bold">1</span>
            <span>/Obra_[Cod].../RDOs</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400 font-bold">2</span>
            <span>/Obra_[Cod].../Fotos</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 font-bold">3</span>
            <span>/Obra_[Cod].../Documentos</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Obra:</span>
          <select
            value={obraFilter}
            onChange={(e) => setObraFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todas as Obras</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.codigo} - {o.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Tipo de Arquivo:</span>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="RDO_PDF">RDO em PDF</option>
            <option value="FOTO">Fotos de Campo</option>
            <option value="PLANTA">Projetos & Plantas</option>
            <option value="RELATORIO">Relatórios Técnicos</option>
            <option value="OUTRO">Outros</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Nenhum documento encontrado com os filtros selecionados.</p>
            <p className="text-[11px] text-slate-500">
              Ao finalizar um RDO, uma cópia em PDF com assinatura e relatório fotográfico é anexada aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Arquivo / Título</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Obra</th>
                  <th className="px-4 py-3">Tamanho</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Inserido por</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDocs.map((docItem) => {
                  const obraVinculada = obras.find((o) => o.id === docItem.obraId);
                  return (
                    <tr key={docItem.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-white flex items-center gap-2">
                        {docItem.tipo === 'RDO_PDF' ? (
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : docItem.tipo === 'FOTO' ? (
                          <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span className="truncate max-w-xs">{docItem.titulo}</span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-950 border border-slate-800 text-slate-300">
                          {docItem.tipo}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-[180px] truncate text-slate-300">
                        {obraVinculada?.nome || 'Obra Geral'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 font-mono">
                        {docItem.tamanho}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-400">
                        {docItem.dataUpload}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-400">
                        {docItem.criadoPor}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          {docItem.arquivoUrl && docItem.arquivoUrl !== '#' && (
                            <a
                              href={docItem.arquivoUrl}
                              download={docItem.titulo}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                              title="Baixar arquivo"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}

                          {isEditor && (
                            <button
                              type="button"
                              onClick={() => handleDelete(docItem)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                              title="Excluir documento"
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

      {/* Google Drive Link Configuration Modal */}
      {driveConfigOpen && selectedObra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Vincular Pasta do Google Drive</h3>
              </div>
              <button
                type="button"
                onClick={() => setDriveConfigOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Obra: <strong className="text-blue-400">{selectedObra.codigo} - {selectedObra.nome}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Link da Pasta no Google Drive
              </label>
              <input
                type="url"
                value={customDriveInput}
                onChange={(e) => setCustomDriveInput(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="text-[10px] text-slate-500">
                Cole o link direto da pasta no Google Drive compartilhada para esta obra. Se deixar vazio, o sistema pesquisará a obra no seu Google Drive.
              </p>
            </div>

            {savedDriveSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link da pasta salvo com sucesso!</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <a
                href={resolveDriveUrl(customDriveInput, selectedObra.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Testar Link</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDriveConfigOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await saveObra({
                        id: selectedObra.id,
                        nome: selectedObra.nome,
                        codigo: selectedObra.codigo,
                        googleDriveUrl: customDriveInput.trim(),
                      });
                      setSavedDriveSuccess(true);
                      setTimeout(() => {
                        setSavedDriveSuccess(false);
                        setDriveConfigOpen(false);
                      }, 1200);
                    } catch (err) {
                      console.error('Erro ao salvar URL do drive:', err);
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-950/30 transition-all"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
