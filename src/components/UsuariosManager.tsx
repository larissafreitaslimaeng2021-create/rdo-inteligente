import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  db,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  OperationType,
  handleFirestoreError,
} from '../lib/firebase';
import { Shield, ShieldAlert, User, Check, Edit2, ShieldCheck, Mail } from 'lucide-react';
import type { UserProfile, UserRole } from '../types';

export const UsuariosManager: React.FC = () => {
  const { user, isEditor } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list: UserProfile[] = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
        setUsersList(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    );

    return () => unsub();
  }, [user]);

  const handleChangeRole = async (targetUid: string, newRole: UserRole) => {
    setUpdatingId(targetUid);
    try {
      await updateDoc(doc(db, 'users', targetUid), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Erro ao atualizar papel do usuário:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span>Gestão de Usuários e Controle de Acesso (RBAC)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Defina as permissões de cada membro: <strong>Editor</strong> (pode criar, editar e finalizar RDOs) ou{' '}
          <strong>Visualizador</strong> (apenas consulta e relatórios).
        </p>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-900/40 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-blue-300">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Perfil: Editor (Engenheiros & Equipe de Obra)</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Permissão completa para cadastrar obras, criar e finalizar RDOs por voz ou formulário, subir fotos do canteiro, gerenciar empresas e homologar diários de obra.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Perfil: Visualizador (Fiscais, Clientes & Auditores)</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Acesso estritamente de consulta: pode navegar pelo Dashboard, visualizar relatórios diários emitidos e baixar os PDFs oficiais, sem permissão para alterar informações técnicas.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Usuários Cadastrados no Sistema</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Usuário / Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Perfil Atual</th>
                <th className="px-4 py-3 text-right">Alterar Perfil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {usersList.map((u) => {
                const isCurrentUser = u.uid === user?.uid;
                return (
                  <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-blue-300 font-bold text-xs uppercase">
                        {u.displayName?.charAt(0) || u.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span>{u.displayName || 'Sem nome informado'}</span>
                        {isCurrentUser && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800 font-medium">
                            Você
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                      {u.email}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          u.role === 'Editor'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {u.role || 'Editor'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      {isEditor && (
                        <div className="inline-flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
                          <button
                            type="button"
                            disabled={updatingId === u.uid}
                            onClick={() => handleChangeRole(u.uid, 'Editor')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              u.role === 'Editor'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Editor
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === u.uid}
                            onClick={() => handleChangeRole(u.uid, 'Visualizador')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              u.role === 'Visualizador'
                                ? 'bg-amber-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Visualizador
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
