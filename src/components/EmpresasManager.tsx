import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Building, Plus, Edit, Trash2, Phone, User, FileText, X } from 'lucide-react';
import type { Empresa } from '../types';

export const EmpresasManager: React.FC = () => {
  const { isEditor } = useAuth();
  const { empresas, saveEmpresa, deleteEmpresa } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contato, setContato] = useState('');
  const [responsavelTecnico, setResponsavelTecnico] = useState('');
  const [creaCau, setCreaCau] = useState('');

  const openNewModal = () => {
    setEditingEmpresa(null);
    setSaveError(null);
    setRazaoSocial('');
    setNomeFantasia('');
    setCnpj('');
    setContato('');
    setResponsavelTecnico('');
    setCreaCau('');
    setModalOpen(true);
  };

  const openEditModal = (emp: Empresa) => {
    setEditingEmpresa(emp);
    setSaveError(null);
    setRazaoSocial(emp.razaoSocial);
    setNomeFantasia(emp.nomeFantasia);
    setCnpj(emp.cnpj);
    setContato(emp.contato);
    setResponsavelTecnico(emp.responsavelTecnico);
    setCreaCau(emp.creaCau);
    setModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setSaveError(null);

    const trimmedRazao = razaoSocial.trim();
    const trimmedNome = nomeFantasia.trim();

    if (!trimmedNome && !trimmedRazao) {
      setSaveError('Por favor, informe a Razão Social ou Nome Fantasia.');
      return;
    }

    setSaving(true);

    try {
      await saveEmpresa({
        id: editingEmpresa?.id,
        razaoSocial: trimmedRazao || trimmedNome,
        nomeFantasia: trimmedNome || trimmedRazao,
        cnpj: cnpj.trim(),
        contato: contato.trim(),
        responsavelTecnico: responsavelTecnico.trim(),
        creaCau: creaCau.trim(),
      });
      setModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao salvar empresa:', err);
      let msg = err?.message || 'Falha ao salvar empresa.';
      if (typeof msg === 'string' && msg.includes('Missing or insufficient permissions')) {
        msg = 'Permissão insuficiente no banco. Verifique se o login está ativo.';
      }
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (emp: Empresa) => {
    try {
      await deleteEmpresa(emp.id);
    } catch (err) {
      console.error('Erro ao excluir empresa:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            <span>Empresas e Construtoras</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastro de empresas construtoras, subempreiteiras e parceiros técnicos
          </p>
        </div>

        {isEditor && (
          <button
            type="button"
            onClick={openNewModal}
            className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Empresa</span>
          </button>
        )}
      </div>

      {empresas.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Building className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhuma empresa cadastrada</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cadastre a empresa de engenharia responsável pelas obras para constar nos cabeçalhos oficiais dos RDOs.
          </p>
          {isEditor && (
            <button
              type="button"
              onClick={openNewModal}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" /> Cadastrar Empresa
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empresas.map((emp) => (
            <div
              key={emp.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 border border-blue-800">
                    Construtora
                  </span>
                  {isEditor && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(emp)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(emp)}
                        className="p-1 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{emp.nomeFantasia}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{emp.razaoSocial}</p>
                </div>

                <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  {emp.cnpj && (
                    <p className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>CNPJ: {emp.cnpj}</span>
                    </p>
                  )}
                  {emp.contato && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{emp.contato}</span>
                    </p>
                  )}
                  {emp.responsavelTecnico && (
                    <p className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {emp.responsavelTecnico} {emp.creaCau && `(${emp.creaCau})`}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                <span>{editingEmpresa ? 'Editar Empresa' : 'Cadastrar Empresa'}</span>
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
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Ex: Construtora Horizonte"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Razão Social *</label>
                <input
                  type="text"
                  required
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Ex: Construtora Horizonte Engenharia Ltda"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefone / E-mail</label>
                  <input
                    type="text"
                    value={contato}
                    onChange={(e) => setContato(e.target.value)}
                    placeholder="(11) 3456-7890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
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
                  <label className="block text-slate-300 font-semibold mb-1">CREA / CAU</label>
                  <input
                    type="text"
                    value={creaCau}
                    onChange={(e) => setCreaCau(e.target.value)}
                    placeholder="CREA/SP 506.123/D"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              {saveError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs">
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
                  <span translate="no">{editingEmpresa ? 'Salvar Alterações' : 'Cadastrar Empresa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
