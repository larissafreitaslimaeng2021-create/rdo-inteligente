import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  db,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  OperationType,
  handleFirestoreError,
} from '../lib/firebase';
import { useAuth } from './AuthContext';
import type { Obra, Empresa, EquipeMembro, RDO, DocumentoItem } from '../types';

interface DataContextType {
  obras: Obra[];
  selectedObraId: string;
  setSelectedObraId: (id: string) => void;
  selectedObra: Obra | undefined;
  empresas: Empresa[];
  equipe: EquipeMembro[];
  rdos: RDO[];
  documentos: DocumentoItem[];
  loadingData: boolean;
  saveObra: (obra: Partial<Obra> & { nome: string; codigo: string }) => Promise<string>;
  deleteObra: (id: string) => Promise<void>;
  saveEmpresa: (empresa: Partial<Empresa> & { razaoSocial: string; nomeFantasia: string }) => Promise<string>;
  deleteEmpresa: (id: string) => Promise<void>;
  saveEquipeMembro: (membro: Partial<EquipeMembro> & { nome: string; funcao: any; obraId: string }) => Promise<string>;
  deleteEquipeMembro: (id: string) => Promise<void>;
  saveRdo: (rdo: Partial<RDO> & { obraId: string; data: string }) => Promise<string>;
  deleteRdo: (id: string) => Promise<void>;
  saveDocumento: (docItem: Partial<DocumentoItem> & { obraId: string; titulo: string; tipo: any }) => Promise<string>;
  deleteDocumento: (id: string) => Promise<void>;
  loadDemoData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObraId, setSelectedObraId] = useState<string>('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [equipe, setEquipe] = useState<EquipeMembro[]>([]);
  const [rdos, setRdos] = useState<RDO[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Subscribe to collections only when authenticated
  useEffect(() => {
    if (!user) {
      setObras([]);
      setEmpresas([]);
      setEquipe([]);
      setRdos([]);
      setDocumentos([]);
      setSelectedObraId('');
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    // 1. Obras listener
    const unsubObras = onSnapshot(
      collection(db, 'obras'),
      (snap) => {
        const list: Obra[] = snap.docs.map((d) => {
          const item = { id: d.id, ...d.data() } as Obra;
          if (item.googleDriveUrl && item.googleDriveUrl.includes('demo-rdo-obra-solar')) {
            item.googleDriveUrl = `https://drive.google.com/drive/u/0/search?q=${encodeURIComponent(
              item.nome.replace(/\[DADOS DE DEMONSTRAÇÃO\]/gi, '').trim()
            )}`;
          }
          return item;
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setObras(list);
        if (list.length > 0 && !selectedObraId) {
          setSelectedObraId(list[0].id);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'obras');
      }
    );

    // 2. Empresas listener
    const unsubEmpresas = onSnapshot(
      collection(db, 'companies'),
      (snap) => {
        const list: Empresa[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Empresa));
        setEmpresas(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'companies');
      }
    );

    // 3. Equipe listener
    const unsubEquipe = onSnapshot(
      collection(db, 'teamMembers'),
      (snap) => {
        const list: EquipeMembro[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as EquipeMembro));
        setEquipe(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'teamMembers');
      }
    );

    // 4. RDOs listener
    const unsubRdos = onSnapshot(
      collection(db, 'rdos'),
      (snap) => {
        const list: RDO[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RDO));
        list.sort((a, b) => (b.numero || 0) - (a.numero || 0));
        setRdos(list);
        setLoadingData(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'rdos');
        setLoadingData(false);
      }
    );

    // 5. Documentos listener
    const unsubDocs = onSnapshot(
      collection(db, 'documents'),
      (snap) => {
        const list: DocumentoItem[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as DocumentoItem));
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setDocumentos(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'documents');
      }
    );

    return () => {
      unsubObras();
      unsubEmpresas();
      unsubEquipe();
      unsubRdos();
      unsubDocs();
    };
  }, [user]);

  // Selected Obra derived object
  const selectedObra = obras.find((o) => o.id === selectedObraId);

  // SAVE OBRA
  const saveObra = async (obraData: Partial<Obra> & { nome: string; codigo: string }): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');
    const id = obraData.id || `obra_${Date.now()}`;
    const docRef = doc(db, 'obras', id);
    const payload: Obra = {
      id,
      codigo: obraData.codigo,
      nome: obraData.nome,
      cliente: obraData.cliente || '',
      endereco: obraData.endereco || '',
      responsavelTecnico: obraData.responsavelTecnico || user.displayName || 'Engenheiro',
      creaCau: obraData.creaCau || '',
      dataInicio: obraData.dataInicio || new Date().toISOString().split('T')[0],
      terminoPrevisto: obraData.terminoPrevisto || '',
      status: obraData.status || 'Em Andamento',
      percentualAvanco: obraData.percentualAvanco || 0,
      googleDriveFolderId: obraData.googleDriveFolderId || '',
      googleDriveFolderName: obraData.googleDriveFolderName || `Obra_${obraData.codigo}_${obraData.nome}`,
      googleDriveUrl: obraData.googleDriveUrl || '',
      companyId: obraData.companyId || '',
      createdBy: obraData.createdBy || user.uid,
      createdAt: obraData.createdAt || new Date().toISOString(),
    };

    // Optimistic state update
    setObras((prev) => {
      const idx = prev.findIndex((o) => o.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = payload;
        return updated;
      }
      return [payload, ...prev];
    });
    if (!selectedObraId) setSelectedObraId(id);

    try {
      await setDoc(docRef, payload, { merge: true });
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `obras/${id}`);
    }
  };

  const deleteObra = async (id: string): Promise<void> => {
    setObras((prev) => {
      const remaining = prev.filter((o) => o.id !== id);
      if (selectedObraId === id) {
        setSelectedObraId(remaining.length > 0 ? remaining[0].id : '');
      }
      return remaining;
    });

    try {
      await deleteDoc(doc(db, 'obras', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `obras/${id}`);
    }
  };

  // SAVE EMPRESA
  const saveEmpresa = async (empresaData: Partial<Empresa> & { razaoSocial: string; nomeFantasia: string }): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');
    const id = empresaData.id || `emp_${Date.now()}`;
    const docRef = doc(db, 'companies', id);
    const payload: Empresa = {
      id,
      razaoSocial: empresaData.razaoSocial,
      nomeFantasia: empresaData.nomeFantasia,
      cnpj: empresaData.cnpj || '',
      contato: empresaData.contato || '',
      responsavelTecnico: empresaData.responsavelTecnico || '',
      creaCau: empresaData.creaCau || '',
      createdBy: empresaData.createdBy || user.uid,
      createdAt: empresaData.createdAt || new Date().toISOString(),
    };

    setEmpresas((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = payload;
        return updated;
      }
      return [payload, ...prev];
    });

    try {
      await setDoc(docRef, payload, { merge: true });
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `companies/${id}`);
    }
  };

  const deleteEmpresa = async (id: string): Promise<void> => {
    setEmpresas((prev) => prev.filter((e) => e.id !== id));

    try {
      await deleteDoc(doc(db, 'companies', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `companies/${id}`);
    }
  };

  // SAVE EQUIPE MEMBRO
  const saveEquipeMembro = async (membroData: Partial<EquipeMembro> & { nome: string; funcao: any; obraId: string }): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');
    const id = membroData.id || `eq_${Date.now()}`;
    const docRef = doc(db, 'teamMembers', id);
    const payload: EquipeMembro = {
      id,
      nome: membroData.nome,
      funcao: membroData.funcao,
      obraId: membroData.obraId,
      telefone: membroData.telefone || '',
      email: membroData.email || '',
      empresaNome: membroData.empresaNome || '',
      status: membroData.status || 'Ativo',
      createdBy: membroData.createdBy || user.uid,
      createdAt: membroData.createdAt || new Date().toISOString(),
    };

    setEquipe((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = payload;
        return updated;
      }
      return [payload, ...prev];
    });

    try {
      await setDoc(docRef, payload, { merge: true });
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `teamMembers/${id}`);
    }
  };

  const deleteEquipeMembro = async (id: string): Promise<void> => {
    setEquipe((prev) => prev.filter((m) => m.id !== id));

    try {
      await deleteDoc(doc(db, 'teamMembers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `teamMembers/${id}`);
    }
  };

  // SAVE RDO
  const saveRdo = async (rdoData: Partial<RDO> & { obraId: string; data: string }): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');
    const id = rdoData.id || `rdo_${Date.now()}`;
    const docRef = doc(db, 'rdos', id);

    // Ensure valid Obra ID
    let finalObraId = rdoData.obraId;
    if (!finalObraId && obras.length > 0) {
      finalObraId = obras[0].id;
    }
    if (!finalObraId) {
      finalObraId = await saveObra({
        nome: 'Obra Principal',
        codigo: 'OBR-01',
        status: 'Em Andamento',
      });
    }

    const obraTarget = obras.find((o) => o.id === finalObraId);

    // Calculate sequential number if not provided
    let numero = rdoData.numero !== undefined ? Number(rdoData.numero) : undefined;
    if (!numero || isNaN(numero)) {
      const obraRdos = rdos.filter((r) => r.obraId === finalObraId);
      const maxNum = obraRdos.reduce((max, r) => Math.max(max, Number(r.numero) || 0), 0);
      numero = maxNum + 1;
    }

    const payload: RDO = {
      id,
      numero: Number(numero) || 1,
      obraId: finalObraId,
      obraNome: rdoData.obraNome || obraTarget?.nome || 'Obra Principal',
      data: rdoData.data || new Date().toLocaleDateString('pt-BR'),
      responsavel: rdoData.responsavel || user.displayName || 'Engenheiro',
      responsavelId: rdoData.responsavelId || user.uid,
      condicoesClimaticas: rdoData.condicoesClimaticas || {
        manha: 'Bom',
        tarde: 'Bom',
        noite: 'Bom',
      },
      etapasFrentes: rdoData.etapasFrentes || '',
      atividadesExecutadas: rdoData.atividadesExecutadas || '',
      percentualAvanco:
        rdoData.percentualAvanco !== undefined
          ? Number(rdoData.percentualAvanco)
          : obraTarget?.percentualAvanco || 0,
      maoDeObra: rdoData.maoDeObra || [],
      equipamentos: rdoData.equipamentos || [],
      materiais: rdoData.materiais || [],
      ocorrencias: rdoData.ocorrencias || '',
      seguranca: rdoData.seguranca || '',
      observacoes: rdoData.observacoes || '',
      fotos: rdoData.fotos || [],
      status: rdoData.status || 'Rascunho',
      pdfUrl: rdoData.pdfUrl || '',
      googleDriveFileId: rdoData.googleDriveFileId || '',
      assinaturaResponsavel: rdoData.assinaturaResponsavel || '',
      assinaturaCliente: rdoData.assinaturaCliente || '',
      createdBy: rdoData.createdBy || user.uid,
      createdAt: rdoData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic RDO state update
    setRdos((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = payload;
        return updated;
      }
      return [payload, ...prev];
    });

    try {
      await setDoc(docRef, payload, { merge: true });

      // If progress changed, update obra progress
      if (
        rdoData.percentualAvanco !== undefined &&
        obraTarget &&
        Number(rdoData.percentualAvanco) > obraTarget.percentualAvanco
      ) {
        await updateDoc(doc(db, 'obras', finalObraId), {
          percentualAvanco: Number(rdoData.percentualAvanco),
        });
      }

      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rdos/${id}`);
    }
  };

  const deleteRdo = async (id: string): Promise<void> => {
    setRdos((prev) => prev.filter((r) => r.id !== id));

    try {
      await deleteDoc(doc(db, 'rdos', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `rdos/${id}`);
    }
  };

  // SAVE DOCUMENTO
  const saveDocumento = async (docData: Partial<DocumentoItem> & { obraId: string; titulo: string; tipo: any }): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');
    const id = docData.id || `doc_${Date.now()}`;
    const docRef = doc(db, 'documents', id);

    const payload: DocumentoItem = {
      id,
      obraId: docData.obraId,
      titulo: docData.titulo,
      tipo: docData.tipo,
      arquivoUrl: docData.arquivoUrl || '',
      tamanho: docData.tamanho || '1.2 MB',
      dataUpload: docData.dataUpload || new Date().toLocaleDateString('pt-BR'),
      criadoPor: docData.criadoPor || user.displayName || 'Engenheiro',
      createdBy: docData.createdBy || user.uid,
      createdAt: docData.createdAt || new Date().toISOString(),
      googleDriveFileId: docData.googleDriveFileId || '',
    };

    setDocumentos((prev) => {
      const idx = prev.findIndex((d) => d.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = payload;
        return updated;
      }
      return [payload, ...prev];
    });

    try {
      await setDoc(docRef, payload, { merge: true });
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `documents/${id}`);
    }
  };

  const deleteDocumento = async (id: string): Promise<void> => {
    setDocumentos((prev) => prev.filter((d) => d.id !== id));

    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `documents/${id}`);
    }
  };

  // LOAD SEED / DEMO DATA (Labeled explicitly as DADOS DE DEMONSTRAÇÃO)
  const loadDemoData = async () => {
    if (!user) return;

    // 1. Empresa Demo
    const demoEmpresaId = `emp_demo_${Date.now()}`;
    await setDoc(doc(db, 'companies', demoEmpresaId), {
      id: demoEmpresaId,
      razaoSocial: '[DADOS DE DEMONSTRAÇÃO] Construtora Horizonte Engenharia Ltda',
      nomeFantasia: '[DADOS DE DEMONSTRAÇÃO] Construtora Horizonte',
      cnpj: '12.345.678/0001-90',
      contato: '(11) 3456-7890 / contato@horizonteeng.com.br',
      responsavelTecnico: 'Eng. Larissa Freitas',
      creaCau: 'CREA/SP 506.123/D',
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
    });

    // 2. Obra Demo
    const demoObraId = `obra_demo_${Date.now()}`;
    await setDoc(doc(db, 'obras', demoObraId), {
      id: demoObraId,
      codigo: 'OBR-2026-01',
      nome: '[DADOS DE DEMONSTRAÇÃO] Edifício Residencial Solar das Palmeiras',
      cliente: 'Incorporadora Habitar S.A.',
      endereco: 'Av. Paulista, 1800 - Bela Vista, São Paulo/SP',
      responsavelTecnico: 'Eng. Larissa Freitas',
      creaCau: 'CREA/SP 506.123/D',
      dataInicio: '2026-02-01',
      terminoPrevisto: '2027-08-30',
      status: 'Em Andamento',
      percentualAvanco: 38.5,
      googleDriveFolderId: 'drive_folder_solar_palmeiras_demo',
      googleDriveFolderName: 'Obra - OBR-2026-01 Solar das Palmeiras',
      googleDriveUrl: 'https://drive.google.com/drive/u/0/search?q=Solar%20das%20Palmeiras',
      companyId: demoEmpresaId,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
    });

    // 3. Equipe Demo
    const equipeMembros = [
      { nome: 'Carlos Eduardo Mello', funcao: 'Engenheiro', fone: '(11) 98765-4321', email: 'carlos@horizonteeng.com.br' },
      { nome: 'Sebastião Alencar (Tião)', funcao: 'Mestre de Obras', fone: '(11) 97654-3210', email: 'mestre.tiao@obra.com' },
      { nome: 'Roberto Vasconcelos', funcao: 'Encarregado', fone: '(11) 96543-2109', email: 'roberto@obra.com' },
      { nome: 'Ana Beatriz Souza', funcao: 'Técnico de Segurança', fone: '(11) 95432-1098', email: 'tst.ana@obra.com' },
    ];

    for (const m of equipeMembros) {
      const mId = `eq_demo_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, 'teamMembers', mId), {
        id: mId,
        nome: `[DADOS DE DEMONSTRAÇÃO] ${m.nome}`,
        funcao: m.funcao,
        obraId: demoObraId,
        telefone: m.fone,
        email: m.email,
        empresaNome: 'Construtora Horizonte',
        status: 'Ativo',
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      });
    }

    // 4. RDOs Demo
    const rdo1Id = `rdo_demo_${Date.now()}`;
    const todayStr = new Date().toLocaleDateString('pt-BR');

    await setDoc(doc(db, 'rdos', rdo1Id), {
      id: rdo1Id,
      numero: 42,
      obraId: demoObraId,
      obraNome: '[DADOS DE DEMONSTRAÇÃO] Edifício Residencial Solar das Palmeiras',
      data: todayStr,
      responsavel: 'Eng. Larissa Freitas',
      responsavelId: user.uid,
      condicoesClimaticas: {
        manha: 'Chuvoso',
        tarde: 'Bom',
        noite: 'Bom',
      },
      etapasFrentes: 'Estrutura de concreto armado - 2º Pavimento Tipo',
      atividadesExecutadas:
        '[DADOS DE DEMONSTRAÇÃO] Concretagem das vigas e laje do 2º pavimento com concreto usinado fck 30 MPa. Desforma parcial do 1º pavimento. Montagem de armaduras das colunas do 3º pavimento.',
      percentualAvanco: 38.5,
      maoDeObra: [
        { funcao: 'Pedreiro', quantidade: 4, empresa: 'Construtora Horizonte' },
        { funcao: 'Servente de Obras', quantidade: 6, empresa: 'Construtora Horizonte' },
        { funcao: 'Carpinteiro', quantidade: 2, empresa: 'Empreiteira Formas Fortes' },
        { funcao: 'Armador', quantidade: 3, empresa: 'Aço Estrutural Ltda' },
        { funcao: 'Eletricista', quantidade: 1, empresa: 'Instalações Luz' },
      ],
      equipamentos: [
        { nome: 'Bomba de Concreto Lança', quantidade: 1, status: 'Operando' },
        { nome: 'Caminhão Betoneira', quantidade: 2, status: 'Operando' },
        { nome: 'Vibrador de Imersão Alta Frequência', quantidade: 2, status: 'Operando' },
        { nome: 'Guincho de Coluna 500kg', quantidade: 1, status: 'Operando' },
      ],
      materiais: [
        { descricao: 'Concreto Usinado bombeável fck 30 MPa', quantidade: '24 m³', tipo: 'Recebido' },
        { descricao: 'Cimento CP-II 50kg', quantidade: '50 sacos', tipo: 'Recebido' },
        { descricao: 'Aço CA-50 10.0mm', quantidade: '800 kg', tipo: 'Utilizado' },
        { descricao: 'Espaçadores plásticos para armadura', quantidade: '500 unid', tipo: 'Utilizado' },
      ],
      ocorrencias:
        '[DADOS DE DEMONSTRAÇÃO] Paralisação parcial da concretagem pela manhã (aproximadamente 1 hora) devido à pancada de chuva forte. O serviço foi retomado normalmente com cobertura de lona plástica e cura úmida programada.',
      seguranca:
        '[DADOS DE DEMONSTRAÇÃO] DDS realizado às 07:00 com foco em trabalho em altura e concretagem. Todos os colaboradores utilizando capacete com jugular, bota de bico composite, óculos e cinto tipo paraquedista com duplo talabarte. Zero acidentes registrados no dia.',
      observacoes:
        '[DADOS DE DEMONSTRAÇÃO] Amostragem de corpos de prova (CPs) realizada pelo laboratório geotécnico para ensaio aos 7 e 28 dias.',
      fotos: [
        {
          id: 'f1',
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80',
          legenda: 'Concretagem da laje e vigas do 2º pavimento com bomba lança',
          dataHora: `${todayStr} 10:15`,
        },
        {
          id: 'f2',
          url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
          legenda: 'Posicionamento das armaduras e verificação de cobrimento com espaçadores',
          dataHora: `${todayStr} 14:30`,
        },
      ],
      status: 'Finalizado',
      assinaturaResponsavel: 'Eng. Larissa Freitas (CREA/SP 506.123/D)',
      assinaturaCliente: 'Fiscalização Habitar S.A.',
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setSelectedObraId(demoObraId);
  };

  return (
    <DataContext.Provider
      value={{
        obras,
        selectedObraId,
        setSelectedObraId,
        selectedObra,
        empresas,
        equipe,
        rdos,
        documentos,
        loadingData,
        saveObra,
        deleteObra,
        saveEmpresa,
        deleteEmpresa,
        saveEquipeMembro,
        deleteEquipeMembro,
        saveRdo,
        deleteRdo,
        saveDocumento,
        deleteDocumento,
        loadDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser utilizado dentro de um DataProvider');
  }
  return context;
};
