import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Users, Plus, Edit, Trash2, Phone, Mail, Building, HardHat, X } from 'lucide-react';
import type { EquipeMembro, FuncaoEquipe } from '../types';

export const EquipeManager: React.FC = () => {
  const { isEditor } = useAuth();
  const { equipe, obras, selectedObraId, saveEquipeMembro, deleteEquipeMembro } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMembro, setEditingMembro] = useState<EquipeMembro | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState<FuncaoEquipe>('Engenheiro');
  const [obraId, setObraId] = useState(selectedObraId || (obras[0]?.id ?? ''));
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [empresaNome, setEmpresaNome] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  const openNewModal = () => {
    setEditingMembro(null);
    setSaveError(null);
    setNome('');
    setFuncao('Engenheiro');
    setObraId(selectedObraId || (obras[0]?.id ?? ''));
    setTelefone('');
    setEmail('');
    setEmpresaNome('');
    setStatus('Ativo');
    setModalOpen(true);
  };

  const openEditModal = (m: EquipeMembro) => {
    setEditingMembro(m);
    setSaveError(null);
    setNome(m.nome);
    setFuncao(m.funcao);
    setObraId(m.obraId);
    setTelefone(m.telefone);
    setEmail(m.email);
    setEmpresaNome(m.empresaNome);
    setStatus(m.status);
    setModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setSaveError(null);

    const trimmedNome = nome.trim();
    if (!trimmedNome) {
      setSaveError('Por favor, informe o Nome do Integrante.');
      return;
    }

    setSaving(true);

    try {
      let finalObraId = obraId;
      if (!finalObraId && obras.length > 0) {
        finalObraId = obras[0].id;
      }

      await saveEquipeMembro({
        id: editingMembro?.id,
        nome: trimmedNome,
        funcao,
        obraId: finalObraId || 'obra_geral',
        telefone: telefone.trim(),
        email: email.trim(),
        empresaNome: empresaNome.trim(),
        status,
      });
      setModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao salvar membro da equipe:', err);
      let msg = err?.message || 'Falha ao salvar membro da equipe.';
      if (typeof msg === 'string' && msg.includes('Missing or insufficient permissions')) {
        msg = 'Permissão insuficiente no banco. Verifique se o login está ativo.';
      }
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: EquipeMembro) => {
    try {
      await deleteEquipeMembro(m.id);
    } catch (err) {
      console.error('Erro ao excluir membro da equipe:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Equipe Técnica do Canteiro</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Engenheiros, mestres de obras, encarregados, estagiários e técnicos vinculados às obras
          </p>
        </div>

        {isEditor && (
          <button
            type="button"
            onClick={openNewModal}
            className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Integrante</span>
          </button>
        )}
      </div>

      {equipe.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhum membro cadastrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cadastre os integrantes da equipe técnica (mestres, engenheiros, encarregados) para facilitar a atribuição no RDO.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipe.map((m) => {
            const obraVinculada = obras.find((o) => o.id === m.obraId);
            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800">
                      {m.funcao}
                    </span>
                    {isEditor && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(m)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m)}
                          className="p-1 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{m.nome}</h3>
                    <p className="text-xs text-blue-400 mt-0.5">{obraVinculada?.nome || 'Obra Geral'}</p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    {m.telefone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{m.telefone}</span>
                      </p>
                    )}
                    {m.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{m.email}</span>
                      </p>
                    )}
                    {m.empresaNome && (
                      <p className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{m.empresaNome}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-6">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{editingMembro ? 'Editar Integrante' : 'Novo Integrante da Equipe'}</span>
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
                <label className="block text-slate-300 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Mello"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Função / Cargo *</label>
                  <select
                    value={funcao}
                    onChange={(e) => setFuncao(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Engenheiro">Engenheiro</option>
                    <option value="Mestre de Obras">Mestre de Obras</option>
                    <option value="Encarregado">Encarregado</option>
                    <option value="Estagiário">Estagiário</option>
                    <option value="Técnico de Segurança">Técnico de Segurança</option>
                    <option value="Topógrafo">Topógrafo</option>
                    <option value="Almoxarife">Almoxarife</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Obra Vinculada</label>
                  <select
                    value={obraId}
                    onChange={(e) => setObraId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {obras.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.codigo} - {o.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefone Celular</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@obra.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Empresa Contratante</label>
                <input
                  type="text"
                  value={empresaNome}
                  onChange={(e) => setEmpresaNome(e.target.value)}
                  placeholder="Ex: Construtora Horizonte"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
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
                  <span translate="no">Salvar Integrante</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
