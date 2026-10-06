import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  Calendar,
  User,
  MapPin,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  X,
  Building,
} from 'lucide-react';
import type { Obra, ObraStatus } from '../types';
import { resolveDriveUrl } from '../lib/googleDrive';

export const ObrasManager: React.FC = () => {
  const { isEditor } = useAuth();
  const { obras, selectedObraId, setSelectedObraId, saveObra, deleteObra, empresas } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [cliente, setCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [responsavelTecnico, setResponsavelTecnico] = useState('');
  const [creaCau, setCreaCau] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [terminoPrevisto, setTerminoPrevisto] = useState('');
  const [status, setStatus] = useState<ObraStatus>('Em Andamento');
  const [percentualAvanco, setPercentualAvanco] = useState<number>(0);
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [companyId, setCompanyId] = useState('');

  const openNewModal = () => {
    setEditingObra(null);
    setSaveError(null);
    setCodigo(`OBR-${new Date().getFullYear()}-${String(obras.length + 1).padStart(2, '0')}`);
    setNome('');
    setCliente('');
    setEndereco('');
    setResponsavelTecnico('');
    setCreaCau('');
    setDataInicio(new Date().toISOString().split('T')[0]);
    setTerminoPrevisto('');
    setStatus('Em Andamento');
    setPercentualAvanco(0);
    setGoogleDriveUrl('');
    setCompanyId(empresas[0]?.id || '');
    setModalOpen(true);
  };

  const openEditModal = (obra: Obra) => {
    setEditingObra(obra);
    setSaveError(null);
    setCodigo(obra.codigo);
    setNome(obra.nome);
    setCliente(obra.cliente);
    setEndereco(obra.endereco);
    setResponsavelTecnico(obra.responsavelTecnico);
    setCreaCau(obra.creaCau);
    setDataInicio(obra.dataInicio);
    setTerminoPrevisto(obra.terminoPrevisto);
    setStatus(obra.status);
    setPercentualAvanco(obra.percentualAvanco);
    setGoogleDriveUrl(obra.googleDriveUrl || '');
    setCompanyId(obra.companyId || empresas[0]?.id || '');
    setModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setSaveError(null);

    const trimmedNome = nome.trim();
    const trimmedCodigo = codigo.trim();

    if (!trimmedNome) {
      setSaveError('Por favor, informe o Nome da Obra.');
      return;
    }
    if (!trimmedCodigo) {
      setSaveError('Por favor, informe o Código da Obra.');
      return;
    }

    setSaving(true);

    try {
      const payload: Partial<Obra> & { nome: string; codigo: string } = {
        id: editingObra?.id,
        codigo: trimmedCodigo,
        nome: trimmedNome,
        cliente: cliente.trim(),
        endereco: endereco.trim(),
        responsavelTecnico: responsavelTecnico.trim(),
        creaCau: creaCau.trim(),
        dataInicio,
        terminoPrevisto,
        status,
        percentualAvanco,
        googleDriveUrl: googleDriveUrl.trim(),
        googleDriveFolderName: `Obra - ${trimmedCodigo} ${trimmedNome}`,
        companyId,
      };

      await saveObra(payload);
      setModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao salvar obra:', err);
      let msg = err?.message || 'Falha ao salvar obra no banco de dados.';
      if (typeof msg === 'string' && msg.includes('Missing or insufficient permissions')) {
        msg = 'Permissão insuficiente no banco. Verifique se o login está ativo.';
      }
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (obra: Obra) => {
    try {
      setDeletingId(obra.id);
      await deleteObra(obra.id);
    } catch (err: any) {
      console.error('Erro ao excluir obra:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>Gestão de Obras e Empreendimentos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastro de canteiros, contratos, prazos e repositórios na nuvem
          </p>
        </div>

        {isEditor && (
          <button
            type="button"
            onClick={openNewModal}
            className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Obra</span>
          </button>
        )}
      </div>

      {/* Grid of Obras */}
      {obras.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhuma obra cadastrada</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cadastre os dados da primeira obra para começar a registrar diários de obra e acompanhar a execução física.
          </p>
          {isEditor && (
            <button
              type="button"
              onClick={openNewModal}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" /> Cadastrar Obra
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {obras.map((obra) => {
            const isSelected = selectedObraId === obra.id;
            return (
              <div
                key={obra.id}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${
                  isSelected ? 'border-blue-500/80 shadow-lg shadow-blue-950/40' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-400 font-bold">
                      {obra.codigo}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        obra.status === 'Em Andamento'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : obra.status === 'Concluída'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {obra.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{obra.nome}</h3>
                    <p className="text-xs text-slate-400 mt-1">Cliente: {obra.cliente || 'Não especificado'}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-xs text-slate-400 pt-1">
                    {obra.endereco && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{obra.endereco}</span>
                      </p>
                    )}
                    {obra.responsavelTecnico && (
                      <p className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">
                          {obra.responsavelTecnico} {obra.creaCau && `(${obra.creaCau})`}
                        </span>
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Início: {obra.dataInicio || 'N/A'}</span>
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Avanço Físico</span>
                      <span className="font-bold text-emerald-400">{obra.percentualAvanco || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, obra.percentualAvanco || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedObraId(obra.id)}
                      className={`py-1 px-2.5 rounded-lg font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {isSelected ? '✓ Obra Ativa' : 'Selecionar'}
                    </button>

                    <a
                      href={resolveDriveUrl(obra.googleDriveUrl, obra.nome)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Abrir pasta no Google Drive"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </a>
                  </div>

                  {isEditor && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(obra)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Editar Obra"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(obra)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Excluir Obra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{editingObra ? 'Editar Cadastro da Obra' : 'Nova Obra'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Código da Obra *</label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ex: OBR-2026-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Nome da Obra *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Edifício Residencial Solar das Palmeiras"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cliente / Contratante</label>
                  <input
                    type="text"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Ex: Incorporadora Habitar S.A."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Empresa Construtora</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nomeFantasia}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Endereço da Obra</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Av. Paulista, 1800 - São Paulo/SP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Responsável Técnico</label>
                  <input
                    type="text"
                    value={responsavelTecnico}
                    onChange={(e) => setResponsavelTecnico(e.target.value)}
                    placeholder="Eng. Larissa Freitas"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Registro CREA / CAU</label>
                  <input
                    type="text"
                    value={creaCau}
                    onChange={(e) => setCreaCau(e.target.value)}
                    placeholder="CREA/SP 506.123/D"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Data Início</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Término Previsto</label>
                  <input
                    type="date"
                    value={terminoPrevisto}
                    onChange={(e) => setTerminoPrevisto(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Paralisada">Paralisada</option>
                    <option value="Planejada">Planejada</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">Avanço Físico Inicial (%)</label>
                  <span className="font-bold text-emerald-400">{percentualAvanco}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percentualAvanco}
                  onChange={(e) => setPercentualAvanco(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Link da Pasta no Google Drive (opcional)
                </label>
                <input
                  type="text"
                  value={googleDriveUrl}
                  onChange={(e) => setGoogleDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              {saveError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium">
                  {saveError}
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="py-2 px-4 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold shadow-md shadow-blue-950/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  <span translate="no">{editingObra ? 'Salvar Alterações' : 'Cadastrar Obra'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
