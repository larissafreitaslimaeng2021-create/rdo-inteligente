import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  Mic,
  Camera,
  Plus,
  Trash2,
  Calendar,
  CloudSun,
  HardHat,
  Truck,
  Package,
  AlertTriangle,
  Shield,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  CheckSquare,
  ListTodo,
  MapPin,
  Layers,
  Compass,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import type {
  RDO,
  MaoDeObraItem,
  EquipamentoItem,
  MaterialItem,
  FotoItem,
  CondicoesClimaticas,
  StructuredAiExtraction,
  AtividadeChecklistItem,
} from '../types';
import { generateRdoPdf } from '../lib/pdfGenerator';

export const ETAPAS_PADRAO = [
  'Serviços Preliminares e Canteiro',
  'Fundações e Contenções',
  'Estrutura de Concreto Armado',
  'Estrutura Metálica',
  'Alvenaria e Vedações',
  'Instalações Hidráulicas e Sanitárias',
  'Instalações Elétricas e Automação',
  'Instalações de Incêndio e SPDA',
  'Impermeabilização',
  'Revestimento Argamassado (Chapisco/Reboco)',
  'Revestimento Cerâmico e Porcelanato',
  'Pisos e Contrapisos',
  'Gesso e Drywall',
  'Esquadrias de Alumínio e Vidros',
  'Pintura e Texturas',
  'Fachada e Acabamento Externo',
  'Cobertura, Telhado e Rufos',
  'Louças, Metais e Bancadas',
  'Paisagismo e Áreas Externas',
  'Limpeza e Vistoria Final',
  'Outra etapa (personalizada)',
];

export const FRENTES_PADRAO = [
  'Subsolo 2',
  'Subsolo 1',
  'Térreo',
  'Pilotis / Garagem',
  'Pavimento 1',
  'Pavimento 2',
  'Pavimento 3',
  'Pavimento 4',
  'Pavimento 5',
  'Pavimento 6',
  'Pavimento 7',
  'Pavimento 8',
  'Pavimento 9',
  'Pavimento 10',
  'Pavimento Tipo',
  'Cobertura / Ático',
  'Barrilete / Caixa d\'Água',
  'Fachada Norte',
  'Fachada Sul',
  'Fachada Leste',
  'Fachada Oeste',
  'Torre A',
  'Torre B',
  'Área Externa / Guarita',
  'Área de Lazer / Piscina',
  'Outra frente (personalizada)',
];

export const LOCAIS_SUGESTOES = [
  'Apartamentos / Unidades',
  'Hall Social',
  'Hall de Serviço',
  'Caixa de Escada',
  'Poço do Elevador',
  'Varanda / Sacada',
  'Cozinha / Área de Serviço',
  'Banheiros',
  'Cisterna / Reservatório',
  'Sala de Máquinas / Barrilete',
  'Subestação / Medidores',
  'Rampa de Garagem',
  'Perímetro / Muro',
  'Canteiro de Obras Geral',
];

export const SUGESTOES_ATIVIDADES_POR_ETAPA: Record<string, string[]> = {
  'Alvenaria e Vedações': [
    'Elevação de alvenaria de blocos cerâmicos/concreto',
    'Aplicação de argamassa de assentamento',
    'Instalação e concretagem de vergas e contravergas',
    'Fixação de telas de amarração e eletrodutos embutidos',
    'Execução de encunhamento / aperto de alvenaria',
  ],
  'Estrutura de Concreto Armado': [
    'Montagem e conferência de formas de vigas e pilares',
    'Armação e posicionamento de armaduras e espaçadores',
    'Concretagem de laje / vigas com caminhão betoneira',
    'Vibração e adensamento do concreto usinado',
    'Cura úmida contínua do concreto',
    'Desforma lateral e posicionamento de escoras remanescentes',
  ],
  'Fundações e Contenções': [
    'Perfuração e escavação de estacas / sapatas',
    'Colocação de armaduras e concretagem de estacas',
    'Execução de blocos de coroamento e baldrames',
    'Escavação e execução de cortina de contenção',
  ],
  'Instalações Hidráulicas e Sanitárias': [
    'Passagem de prumadas principais de água fria e quente',
    'Instalação de ramais de esgoto sanitário e ventilação',
    'Teste de estanqueidade e pressão hidrostática',
    'Chumbamento e fixação de tubulações em shafts',
  ],
  'Instalações Elétricas e Automação': [
    'Passagem de fiação e cabos nos eletrodutos',
    'Montagem e identificação do Quadro de Distribuição (QDC)',
    'Instalação de caixas de passagem, interruptores e tomadas',
    'Infraestrutura para cabeamento estruturado e ar-condicionado',
  ],
  'Impermeabilização': [
    'Regularização de superfície e arredondamento de cantos (meia-cana)',
    'Aplicação de primer asfáltico',
    'Aplicação de manta asfáltica termossoldada',
    'Realização de teste de estanqueidade com lâmina de água de 72h',
    'Execução de camada de proteção mecânica',
  ],
  'Revestimento Argamassado (Chapisco/Reboco)': [
    'Aplicação de chapisco com aditivo de aderência',
    'Instalação de taliscas e mestras de nível',
    'Aplicação e sarrafeamento de emboço/reboco',
    'Desempeno e acabamento final da superfície',
  ],
  'Revestimento Cerâmico e Porcelanato': [
    'Preparo da base e conferência de esquadro',
    'Aplicação de argamassa colante com desempenadeira dentada',
    'Assentamento de placas de porcelanato com niveladores',
    'Aplicação de rejunte epóxi/cimentício e limpeza',
  ],
  'Pintura e Texturas': [
    'Lixamento e limpeza profunda das paredes',
    'Aplicação de selador e fundo preparador',
    'Aplicação de massa corrida/acrílica em duas demãos',
    'Pintura de acabamento com tinta látex acrílica premium',
  ],
};

interface RdoFormProps {
  initialRdo?: RDO;
  onClose: () => void;
  onOpenVoiceModal: () => void;
  pendingAiExtraction?: StructuredAiExtraction | null;
  onClearAiExtraction?: () => void;
}

export const RdoForm: React.FC<RdoFormProps> = ({
  initialRdo,
  onClose,
  onOpenVoiceModal,
  pendingAiExtraction,
  onClearAiExtraction,
}) => {
  const { user, isEditor } = useAuth();
  const { obras, selectedObraId, selectedObra, saveRdo, saveDocumento, empresas } = useData();

  const [activeTab, setActiveTab] = useState<
    'identificacao' | 'atividades' | 'maodeobra' | 'equipamentos' | 'materiais' | 'ocorrencias' | 'fotos' | 'finalizar'
  >('identificacao');

  // Form states
  const [obraId, setObraId] = useState(initialRdo?.obraId || selectedObraId || (obras[0]?.id ?? ''));
  const [data, setData] = useState(initialRdo?.data || new Date().toLocaleDateString('pt-BR'));
  const [numero, setNumero] = useState<number | undefined>(initialRdo?.numero);
  const [responsavel, setResponsavel] = useState(initialRdo?.responsavel || user?.displayName || 'Engenheiro');
  const [condicoesClimaticas, setCondicoesClimaticas] = useState<CondicoesClimaticas>(
    initialRdo?.condicoesClimaticas || {
      manha: 'Bom',
      tarde: 'Bom',
      noite: 'Bom',
    }
  );

  // Separated Etapa, Frente de Serviço, Local
  const [etapa, setEtapa] = useState(initialRdo?.etapa || '');
  const [customEtapa, setCustomEtapa] = useState('');
  const [frenteServico, setFrenteServico] = useState(initialRdo?.frenteServico || '');
  const [customFrente, setCustomFrente] = useState('');
  const [local, setLocal] = useState(initialRdo?.local || '');
  const [etapasFrentes, setEtapasFrentes] = useState(initialRdo?.etapasFrentes || '');

  // Atividades Mode & Checklist State
  const [atividadesViewMode, setAtividadesViewMode] = useState<'checklist' | 'texto'>('checklist');
  const [atividadesExecutadas, setAtividadesExecutadas] = useState(initialRdo?.atividadesExecutadas || '');
  const [atividadesChecklist, setAtividadesChecklist] = useState<AtividadeChecklistItem[]>(() => {
    if (initialRdo?.atividadesChecklist && initialRdo.atividadesChecklist.length > 0) {
      return initialRdo.atividadesChecklist;
    }
    // Parse from text if existing
    if (initialRdo?.atividadesExecutadas) {
      const lines = initialRdo.atividadesExecutadas
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length > 0) {
        return lines.map((line, idx) => ({
          id: `act_init_${idx}`,
          descricao: line.replace(/^[•\-\*\d\.\)]\s*/, '').replace(/\[conclu[íi]do\]/gi, '').trim(),
          concluida: line.toLowerCase().includes('conclu'),
          status: line.toLowerCase().includes('conclu') ? 'Concluído' : 'Em Andamento',
        }));
      }
    }
    return [
      { id: 'act_1', descricao: '', concluida: false, status: 'Em Andamento' },
    ];
  });

  const [percentualAvanco, setPercentualAvanco] = useState<number>(
    initialRdo?.percentualAvanco !== undefined ? initialRdo.percentualAvanco : selectedObra?.percentualAvanco || 0
  );
  const [maoDeObra, setMaoDeObra] = useState<MaoDeObraItem[]>(initialRdo?.maoDeObra || []);
  const [equipamentos, setEquipamentos] = useState<EquipamentoItem[]>(initialRdo?.equipamentos || []);
  const [materiais, setMateriais] = useState<MaterialItem[]>(initialRdo?.materiais || []);
  const [ocorrencias, setOcorrencias] = useState(initialRdo?.ocorrencias || '');
  const [seguranca, setSeguranca] = useState(initialRdo?.seguranca || 'DDS realizado. Nenhum acidente registrado.');
  const [observacoes, setObservacoes] = useState(initialRdo?.observacoes || '');
  const [fotos, setFotos] = useState<FotoItem[]>(initialRdo?.fotos || []);
  const [status, setStatus] = useState<'Rascunho' | 'Finalizado'>(initialRdo?.status || 'Rascunho');
  const [assinaturaResponsavel, setAssinaturaResponsavel] = useState(
    initialRdo?.assinaturaResponsavel || `${user?.displayName || 'Engenheiro'} (CREA/CAU ativo)`
  );
  const [assinaturaCliente, setAssinaturaCliente] = useState(initialRdo?.assinaturaCliente || 'Fiscalização / Contratante');
  const [saveError, setSaveError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync checklist to text narrative
  const syncChecklistToText = (items: AtividadeChecklistItem[]) => {
    const valid = items.filter((it) => it.descricao.trim().length > 0);
    if (!valid.length) return;
    const text = valid
      .map(
        (it) =>
          `• [${it.status || (it.concluida ? 'Concluído' : 'Em Andamento')}] ${it.descricao.trim()}${
            it.local ? ` (${it.local.trim()})` : ''
          }`
      )
      .join('\n');
    setAtividadesExecutadas(text);
  };

  // Convert text narrative to checklist
  const convertTextToChecklist = (text: string) => {
    if (!text.trim()) return;
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const newItems: AtividadeChecklistItem[] = lines.map((line, idx) => {
      let desc = line.replace(/^[•\-\*\d\.\)]\s*/, '').trim();
      let itemStatus: 'Concluído' | 'Em Andamento' | 'Iniciado' = 'Em Andamento';
      let concluida = false;

      if (desc.toLowerCase().includes('[concluído]') || desc.toLowerCase().includes('[concluido]')) {
        itemStatus = 'Concluído';
        concluida = true;
        desc = desc.replace(/\[conclu[íi]do\]/gi, '').trim();
      } else if (desc.toLowerCase().includes('[iniciado]')) {
        itemStatus = 'Iniciado';
        concluida = false;
        desc = desc.replace(/\[iniciado\]/gi, '').trim();
      } else if (desc.toLowerCase().includes('[em andamento]')) {
        itemStatus = 'Em Andamento';
        concluida = false;
        desc = desc.replace(/\[em andamento\]/gi, '').trim();
      }

      return {
        id: `act_${Date.now()}_${idx}`,
        descricao: desc,
        concluida,
        status: itemStatus,
        local: local || undefined,
      };
    });

    setAtividadesChecklist(newItems);
  };

  const addChecklistItem = (desc = '') => {
    const newItem: AtividadeChecklistItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      descricao: desc,
      concluida: false,
      status: 'Em Andamento',
      local: local || '',
    };
    const updated = [...atividadesChecklist, newItem];
    setAtividadesChecklist(updated);
    syncChecklistToText(updated);
  };

  const toggleChecklistItem = (id: string) => {
    const updated = atividadesChecklist.map((it) => {
      if (it.id === id) {
        const nextConcluida = !it.concluida;
        return {
          ...it,
          concluida: nextConcluida,
          status: nextConcluida ? ('Concluído' as const) : ('Em Andamento' as const),
        };
      }
      return it;
    });
    setAtividadesChecklist(updated);
    syncChecklistToText(updated);
  };

  const updateChecklistItem = (id: string, updates: Partial<AtividadeChecklistItem>) => {
    const updated = atividadesChecklist.map((it) => {
      if (it.id === id) {
        const item = { ...it, ...updates };
        if (updates.status === 'Concluído') item.concluida = true;
        if (updates.status && updates.status !== 'Concluído') item.concluida = false;
        return item;
      }
      return it;
    });
    setAtividadesChecklist(updated);
    syncChecklistToText(updated);
  };

  const removeChecklistItem = (id: string) => {
    const updated = atividadesChecklist.filter((it) => it.id !== id);
    setAtividadesChecklist(updated);
    syncChecklistToText(updated);
  };

  const loadStageSuggestions = (stageName: string) => {
    const suggestions = SUGESTOES_ATIVIDADES_POR_ETAPA[stageName] || [];
    if (!suggestions.length) return;
    const newItems: AtividadeChecklistItem[] = suggestions.map((s, idx) => ({
      id: `act_${Date.now()}_${idx}`,
      descricao: s,
      concluida: false,
      status: 'Em Andamento',
      local: local || '',
    }));
    const updated = [
      ...atividadesChecklist.filter((it) => it.descricao.trim().length > 0),
      ...newItems,
    ];
    setAtividadesChecklist(updated);
    syncChecklistToText(updated);
  };

  // Apply AI Extraction if passed
  useEffect(() => {
    if (pendingAiExtraction) {
      if (pendingAiExtraction.atividadesExecutadas) {
        setAtividadesExecutadas((prev) =>
          prev ? `${prev}\n\n${pendingAiExtraction.atividadesExecutadas}` : pendingAiExtraction.atividadesExecutadas!
        );
        convertTextToChecklist(pendingAiExtraction.atividadesExecutadas);
      }
      if (pendingAiExtraction.etapasFrentes) {
        setEtapasFrentes(pendingAiExtraction.etapasFrentes);
      }
      if (pendingAiExtraction.etapa) {
        setEtapa(pendingAiExtraction.etapa);
      }
      if (pendingAiExtraction.frenteServico) {
        setFrenteServico(pendingAiExtraction.frenteServico);
      }
      if (pendingAiExtraction.local) {
        setLocal(pendingAiExtraction.local);
      }
      if (pendingAiExtraction.percentualAvanco !== null && pendingAiExtraction.percentualAvanco !== undefined) {
        setPercentualAvanco(pendingAiExtraction.percentualAvanco);
      }
      if (pendingAiExtraction.climaManha) {
        setCondicoesClimaticas((prev) => ({
          ...prev,
          manha: (pendingAiExtraction.climaManha as any) || prev.manha,
          tarde: (pendingAiExtraction.climaTarde as any) || prev.tarde,
        }));
      }
      if (pendingAiExtraction.maoDeObra && pendingAiExtraction.maoDeObra.length > 0) {
        setMaoDeObra((prev) => [...prev, ...pendingAiExtraction.maoDeObra!]);
      }
      if (pendingAiExtraction.equipamentos && pendingAiExtraction.equipamentos.length > 0) {
        setEquipamentos((prev) => [...prev, ...pendingAiExtraction.equipamentos!]);
      }
      if (pendingAiExtraction.materiais && pendingAiExtraction.materiais.length > 0) {
        setMateriais((prev) => [...prev, ...pendingAiExtraction.materiais!]);
      }
      if (pendingAiExtraction.ocorrencias) {
        setOcorrencias((prev) =>
          prev ? `${prev}\n${pendingAiExtraction.ocorrencias}` : pendingAiExtraction.ocorrencias!
        );
      }
      if (pendingAiExtraction.seguranca) {
        setSeguranca(pendingAiExtraction.seguranca);
      }
      if (pendingAiExtraction.observacoes) {
        setObservacoes((prev) =>
          prev ? `${prev}\n${pendingAiExtraction.observacoes}` : pendingAiExtraction.observacoes!
        );
      }

      onClearAiExtraction?.();
    }
  }, [pendingAiExtraction]);

  // Tab definitions
  const tabs = [
    { id: 'identificacao', label: '1. Clima e Geral' },
    { id: 'atividades', label: '2. Atividades e Avanço' },
    { id: 'maodeobra', label: '3. Mão de Obra' },
    { id: 'equipamentos', label: '4. Equipamentos' },
    { id: 'materiais', label: '5. Materiais' },
    { id: 'ocorrencias', label: '6. Segurança e Ocorrências' },
    { id: 'fotos', label: '7. Fotos' },
    { id: 'finalizar', label: '8. Finalização e PDF' },
  ];

  // Helper additions for items
  const addMaoDeObra = () => {
    setMaoDeObra([...maoDeObra, { funcao: 'Pedreiro', quantidade: 1, empresa: '' }]);
  };

  const removeMaoDeObra = (index: number) => {
    setMaoDeObra(maoDeObra.filter((_, i) => i !== index));
  };

  const addEquipamento = () => {
    setEquipamentos([...equipamentos, { nome: '', quantidade: 1, status: 'Operando' }]);
  };

  const removeEquipamento = (index: number) => {
    setEquipamentos(equipamentos.filter((_, i) => i !== index));
  };

  const addMaterial = () => {
    setMateriais([...materiais, { descricao: '', quantidade: '', tipo: 'Recebido' }]);
  };

  const removeMaterial = (index: number) => {
    setMateriais(materiais.filter((_, i) => i !== index));
  };

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFoto: FotoItem = {
          id: `foto_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          url: reader.result as string,
          legenda: 'Registro fotográfico dos serviços executados',
          dataHora: `${data} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        };
        setFotos((prev) => [...prev, newFoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFoto = (id: string) => {
    setFotos(fotos.filter((f) => f.id !== id));
  };

  // Save handler
  const handleSave = async (targetStatus: 'Rascunho' | 'Finalizado') => {
    setSaving(true);
    setSavedSuccess(false);
    setSaveError(null);

    try {
      let targetObraId = obraId;
      if (!targetObraId && obras.length > 0) {
        targetObraId = obras[0].id;
        setObraId(targetObraId);
      }

      const obraItem = obras.find((o) => o.id === targetObraId);

      const resolvedEtapa = etapa === 'Outra etapa (personalizada)' ? customEtapa : (etapa || customEtapa);
      const resolvedFrente = frenteServico === 'Outra frente (personalizada)' ? customFrente : (frenteServico || customFrente);
      const parts = [resolvedEtapa, resolvedFrente, local].filter(Boolean);
      const combinedEtapasFrentes = parts.length > 0 ? parts.join(' • ') : etapasFrentes;

      const validChecklist = atividadesChecklist.filter((it) => it.descricao.trim().length > 0);
      const combinedAtividades =
        atividadesExecutadas.trim() ||
        validChecklist
          .map(
            (it) =>
              `• [${it.status || (it.concluida ? 'Concluído' : 'Em Andamento')}] ${it.descricao.trim()}${
                it.local ? ` (${it.local.trim()})` : ''
              }`
          )
          .join('\n');

      const rdoPayload: Partial<RDO> & { obraId: string; data: string } = {
        id: initialRdo?.id,
        numero: numero !== undefined ? Number(numero) : undefined,
        obraId: targetObraId,
        obraNome: obraItem?.nome || 'Obra Principal',
        data,
        responsavel,
        condicoesClimaticas,
        etapasFrentes: combinedEtapasFrentes,
        etapa: resolvedEtapa || undefined,
        frenteServico: resolvedFrente || undefined,
        local: local || undefined,
        atividadesExecutadas: combinedAtividades,
        atividadesChecklist: validChecklist.length > 0 ? validChecklist : undefined,
        percentualAvanco: Number(percentualAvanco) || 0,
        maoDeObra,
        equipamentos,
        materiais,
        ocorrencias,
        seguranca,
        observacoes,
        fotos,
        status: targetStatus,
        assinaturaResponsavel,
        assinaturaCliente,
      };

      const savedId = await saveRdo(rdoPayload);
      setStatus(targetStatus);
      setSavedSuccess(true);

      // If finalizing, generate and store PDF into Documents automatically
      if (targetStatus === 'Finalizado') {
        const fullRdoObj: RDO = {
          ...(rdoPayload as any),
          id: savedId,
          numero: numero || 1,
          createdAt: initialRdo?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user?.uid || '',
        };

        const empresaItem = empresas.find((e) => e.id === obraItem?.companyId) || empresas[0];
        try {
          const pdfDoc = await generateRdoPdf(fullRdoObj, obraItem, empresaItem);
          const pdfBlob = pdfDoc.output('blob');

          // Create document entry
          await saveDocumento({
            obraId: targetObraId,
            titulo: `RDO Nº ${String(fullRdoObj.numero).padStart(3, '0')} - ${data}`,
            tipo: 'RDO_PDF',
            arquivoUrl: URL.createObjectURL(pdfBlob),
            tamanho: `${(pdfBlob.size / 1024).toFixed(0)} KB`,
            dataUpload: data,
            criadoPor: responsavel,
          });
        } catch (pdfErr) {
          console.warn('Could not auto-generate PDF for document archive:', pdfErr);
        }
      }

      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar RDO:', err);
      setSaveError(err?.message || 'Falha ao gravar RDO no banco de dados.');
    } finally {
      setSaving(false);
    }
  };

  // Download PDF directly
  const handleDownloadPdf = async () => {
    const obraItem = obras.find((o) => o.id === obraId);
    const empresaItem = empresas.find((e) => e.id === obraItem?.companyId) || empresas[0];

    const currentRdo: RDO = {
      id: initialRdo?.id || 'preview',
      numero: numero || 1,
      obraId,
      obraNome: obraItem?.nome || 'Obra',
      data,
      responsavel,
      responsavelId: user?.uid || '',
      condicoesClimaticas,
      etapasFrentes,
      atividadesExecutadas,
      percentualAvanco,
      maoDeObra,
      equipamentos,
      materiais,
      ocorrencias,
      seguranca,
      observacoes,
      fotos,
      status,
      assinaturaResponsavel,
      assinaturaCliente,
      createdBy: user?.uid || '',
      createdAt: initialRdo?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const pdfDoc = await generateRdoPdf(currentRdo, obraItem, empresaItem);
    pdfDoc.save(`RDO_${String(currentRdo.numero).padStart(3, '0')}_${data.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto my-4 sm:my-6">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {initialRdo ? `Editar RDO Nº ${String(numero || 0).padStart(3, '0')}` : 'Novo Relatório Diário de Obra'}
              </h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  status === 'Finalizado' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-400">Preenchimento técnico diário de canteiro de obras</p>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2">
          {isEditor && (
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition-all"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Gravar com IA</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Exportar PDF do RDO"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Gerar PDF</span>
          </button>

          {isEditor && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('Rascunho')}
              className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Salvando...' : 'Salvar Rascunho'}</span>
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-5 py-2.5 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Relatório salvo com sucesso no banco de dados!</span>
        </div>
      )}

      {saveError && (
        <div className="bg-red-950/80 border-b border-red-800/80 px-5 py-2.5 text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Navigation Tabs (Mobile-first scrollable) */}
      <div className="px-3 bg-slate-950 border-b border-slate-800 overflow-x-auto flex items-center gap-1 py-1.5 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* TAB 1: IDENTIFICAÇÃO E CLIMA */}
        {activeTab === 'identificacao' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Obra Vinculada</label>
                <select
                  disabled={!isEditor}
                  value={obraId}
                  onChange={(e) => setObraId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {obras.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.codigo} - {o.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Data do Relatório (DD/MM/AAAA)</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    disabled={!isEditor}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Responsável Técnico</label>
                <input
                  type="text"
                  disabled={!isEditor}
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Nome do Engenheiro / Técnico"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            {/* Weather Period Block */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-amber-400" /> Condições Climáticas por Período
              </h4>
              <p className="text-[11px] text-slate-400">
                Selecione as condições de tempo de cada período para respaldar prazos e paralisações operacionais.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['manha', 'tarde', 'noite'] as const).map((periodo) => (
                  <div key={periodo} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {periodo === 'manha' ? 'Manhã' : periodo === 'tarde' ? 'Tarde' : 'Noite'}
                    </span>
                    <select
                      disabled={!isEditor}
                      value={condicoesClimaticas[periodo]}
                      onChange={(e) =>
                        setCondicoesClimaticas({
                          ...condicoesClimaticas,
                          [periodo]: e.target.value as any,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Bom">Bom (Praticável)</option>
                      <option value="Nublado">Nublado</option>
                      <option value="Chuvoso">Chuvoso</option>
                      <option value="Impraticável">Impraticável (Chuva intensa / Paralisação)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SERVIÇOS E AVANÇO */}
        {activeTab === 'atividades' && (
          <div className="space-y-6">
            {/* 1. SEPARATED: ETAPA, FRENTE DE SERVIÇO E LOCAL */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Etapa, Frente de Serviço e Local
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Campos separados com seleção rápida e detalhamento
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1.1 Etapa da Obra */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Etapa da Obra
                  </label>
                  <select
                    disabled={!isEditor}
                    value={etapa}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEtapa(val);
                      if (val !== 'Outra etapa (personalizada)') {
                        setCustomEtapa('');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                  >
                    <option value="">Selecione uma etapa...</option>
                    {ETAPAS_PADRAO.map((et) => (
                      <option key={et} value={et} className="bg-slate-900 text-slate-100">
                        {et}
                      </option>
                    ))}
                  </select>
                  {etapa === 'Outra etapa (personalizada)' && (
                    <input
                      type="text"
                      disabled={!isEditor}
                      value={customEtapa}
                      onChange={(e) => setCustomEtapa(e.target.value)}
                      placeholder="Digite a etapa personalizada..."
                      className="w-full mt-1.5 bg-slate-950 border border-blue-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  )}
                  <p className="text-[10px] text-slate-500">Fase macro do cronograma da obra</p>
                </div>

                {/* 1.2 Frente de Serviço */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    Frente de Serviço
                  </label>
                  <select
                    disabled={!isEditor}
                    value={frenteServico}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFrenteServico(val);
                      if (val !== 'Outra frente (personalizada)') {
                        setCustomFrente('');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                  >
                    <option value="">Selecione a frente / pavimento...</option>
                    {FRENTES_PADRAO.map((fr) => (
                      <option key={fr} value={fr} className="bg-slate-900 text-slate-100">
                        {fr}
                      </option>
                    ))}
                  </select>
                  {frenteServico === 'Outra frente (personalizada)' && (
                    <input
                      type="text"
                      disabled={!isEditor}
                      value={customFrente}
                      onChange={(e) => setCustomFrente(e.target.value)}
                      placeholder="Digite a frente personalizada..."
                      className="w-full mt-1.5 bg-slate-950 border border-amber-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  )}
                  <p className="text-[10px] text-slate-500">Pavimento, torre ou fachada em execução</p>
                </div>

                {/* 1.3 Local / Ambiente Específico */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Local / Ambiente Específico
                  </label>
                  <input
                    type="text"
                    disabled={!isEditor}
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex: Aptos 401 e 402, Hall, Caixa de Escada..."
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  {/* Quick suggestion pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {LOCAIS_SUGESTOES.slice(0, 6).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        disabled={!isEditor}
                        onClick={() => {
                          setLocal((prev) => (prev ? `${prev}, ${sug}` : sug));
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ATIVIDADES EXECUTADAS NO DIA (CHECKLIST & TEXTO NARRATIVO) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Atividades Executadas no Dia
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {atividadesViewMode === 'checklist'
                      ? `${atividadesChecklist.filter((i) => i.concluida || i.status === 'Concluído').length} de ${
                          atividadesChecklist.length
                        } atividades concluídas`
                      : 'Modo texto narrativo livre com suporte a ditado por voz com IA'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Toggle Checklist / Texto */}
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setAtividadesViewMode('checklist')}
                      className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                        atividadesViewMode === 'checklist'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Modo Checklist</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAtividadesViewMode('texto')}
                      className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                        atividadesViewMode === 'texto'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Modo Texto</span>
                    </button>
                  </div>

                  {/* Voice Dictation button */}
                  {isEditor && (
                    <button
                      type="button"
                      onClick={onOpenVoiceModal}
                      className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
                      title="Gravar relato por voz com IA"
                    >
                      <Mic className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Relato por Voz</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2.1 MODO CHECKLIST */}
              {atividadesViewMode === 'checklist' ? (
                <div className="space-y-3">
                  {/* Action Bar inside Checklist */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={!isEditor}
                        onClick={() => addChecklistItem('')}
                        className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Atividade
                      </button>

                      {etapa && SUGESTOES_ATIVIDADES_POR_ETAPA[etapa] && (
                        <button
                          type="button"
                          disabled={!isEditor}
                          onClick={() => loadStageSuggestions(etapa)}
                          className="py-1.5 px-3 rounded-lg bg-purple-950/60 hover:bg-purple-900/70 border border-purple-800/80 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                          title={`Adicionar atividades típicas de ${etapa}`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>Sugestões de {etapa.split(' ')[0]}</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => syncChecklistToText(atividadesChecklist)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-900 transition-colors"
                      title="Atualiza o relato de texto com os itens deste checklist"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sincronizar com Texto</span>
                    </button>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-2">
                    {atividadesChecklist.length === 0 ? (
                      <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                        Nenhuma atividade adicionada. Clique em "+ Adicionar Atividade" ou use as sugestões da etapa.
                      </div>
                    ) : (
                      atividadesChecklist.map((item, index) => (
                        <div
                          key={item.id || index}
                          className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                            item.concluida || item.status === 'Concluído'
                              ? 'bg-emerald-950/20 border-emerald-800/40'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Checkbox button */}
                          <button
                            type="button"
                            disabled={!isEditor}
                            onClick={() => toggleChecklistItem(item.id)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all mt-0.5 shrink-0 ${
                              item.concluida || item.status === 'Concluído'
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                                : 'border-slate-700 hover:border-slate-500 bg-slate-900'
                            }`}
                            title={
                              item.concluida || item.status === 'Concluído'
                                ? 'Marcar como Em Andamento'
                                : 'Marcar como Concluído'
                            }
                          >
                            {(item.concluida || item.status === 'Concluído') && (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Activity Description & Metadata */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <input
                              type="text"
                              disabled={!isEditor}
                              value={item.descricao}
                              onChange={(e) => updateChecklistItem(item.id, { descricao: e.target.value })}
                              placeholder="Descreva a atividade executada (ex: Concretagem de laje, Alvenaria...)"
                              className={`w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none ${
                                item.concluida || item.status === 'Concluído'
                                  ? 'line-through text-slate-400'
                                  : 'font-medium'
                              }`}
                            />

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Status Badge Selector */}
                              <select
                                disabled={!isEditor}
                                value={item.status || (item.concluida ? 'Concluído' : 'Em Andamento')}
                                onChange={(e) => updateChecklistItem(item.id, { status: e.target.value as any })}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                  item.status === 'Concluído'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                    : item.status === 'Em Andamento'
                                    ? 'bg-blue-950 text-blue-300 border-blue-800'
                                    : item.status === 'Iniciado'
                                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                                    : 'bg-slate-900 text-slate-400 border-slate-700'
                                }`}
                              >
                                <option value="Concluído" className="bg-slate-900 text-slate-100">
                                  ✓ Concluído
                                </option>
                                <option value="Em Andamento" className="bg-slate-900 text-slate-100">
                                  ⏳ Em Andamento
                                </option>
                                <option value="Iniciado" className="bg-slate-900 text-slate-100">
                                  ⚡ Iniciado
                                </option>
                                <option value="Pendente" className="bg-slate-900 text-slate-100">
                                  ○ Pendente
                                </option>
                              </select>

                              {/* Specific local detail for this task */}
                              <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-0.5">
                                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                <input
                                  type="text"
                                  disabled={!isEditor}
                                  value={item.local || ''}
                                  onChange={(e) => updateChecklistItem(item.id, { local: e.target.value })}
                                  placeholder="Local específico (opcional)"
                                  className="bg-transparent text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none w-36 sm:w-48"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Delete Item */}
                          {isEditor && (
                            <button
                              type="button"
                              onClick={() => removeChecklistItem(item.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-all shrink-0 mt-0.5"
                              title="Remover atividade"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* 2.2 MODO TEXTO NARRATIVO */
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    disabled={!isEditor}
                    value={atividadesExecutadas}
                    onChange={(e) => setAtividadesExecutadas(e.target.value)}
                    placeholder="Descreva detalhadamente os serviços realizados pela equipe no dia..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 leading-relaxed"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      disabled={!isEditor || !atividadesExecutadas.trim()}
                      onClick={() => {
                        convertTextToChecklist(atividadesExecutadas);
                        setAtividadesViewMode('checklist');
                      }}
                      className="py-1.5 px-3 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/80 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Converter este texto em Checklist interativo</span>
                    </button>

                    <span className="text-[11px] text-slate-500">
                      {atividadesExecutadas.length} caracteres informados
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. PERCENTUAL DE AVANÇO */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Percentual de Avanço Físico Acumulado da Obra
                </label>
                <span className="text-sm font-bold text-emerald-400">{percentualAvanco}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                disabled={!isEditor}
                value={percentualAvanco}
                onChange={(e) => setPercentualAvanco(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% (Início)</span>
                <span>50% (Meio)</span>
                <span>100% (Conclusão)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MÃO DE OBRA */}
        {activeTab === 'maodeobra' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-blue-400" /> Mão de Obra e Efetivo no Canteiro
                </h4>
                <p className="text-[11px] text-slate-400">
                  Total de colaboradores presentes:{' '}
                  <strong className="text-blue-400">
                    {maoDeObra.reduce((sum, item) => sum + (Number(item.quantidade) || 0), 0)}
                  </strong>
                </p>
              </div>

              {isEditor && (
                <button
                  type="button"
                  onClick={addMaoDeObra}
                  className="py-1 px-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Função
                </button>
              )}
            </div>

            {maoDeObra.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                Nenhum colaborador registrado. Clique em "+ Adicionar Função" ou use a IA por voz.
              </div>
            ) : (
              <div className="space-y-2">
                {maoDeObra.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Função</label>
                      <input
                        type="text"
                        disabled={!isEditor}
                        value={item.funcao}
                        onChange={(e) => {
                          const updated = [...maoDeObra];
                          updated[index].funcao = e.target.value;
                          setMaoDeObra(updated);
                        }}
                        placeholder="Ex: Pedreiro, Servente, Armador"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Qtd.</label>
                      <input
                        type="number"
                        min="1"
                        disabled={!isEditor}
                        value={item.quantidade}
                        onChange={(e) => {
                          const updated = [...maoDeObra];
                          updated[index].quantidade = Math.max(1, Number(e.target.value));
                          setMaoDeObra(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 text-center"
                      />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Empresa / Empreiteiro</label>
                      <input
                        type="text"
                        disabled={!isEditor}
                        value={item.empresa || ''}
                        onChange={(e) => {
                          const updated = [...maoDeObra];
                          updated[index].empresa = e.target.value;
                          setMaoDeObra(updated);
                        }}
                        placeholder="Ex: Direta ou Subempreiteira"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>

                    {isEditor && (
                      <button
                        type="button"
                        onClick={() => removeMaoDeObra(index)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors mt-3 sm:mt-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EQUIPAMENTOS */}
        {activeTab === 'equipamentos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" /> Equipamentos e Maquinários
                </h4>
                <p className="text-[11px] text-slate-400">Registre betoneiras, guinchos, escavadeiras e ferramentas</p>
              </div>

              {isEditor && (
                <button
                  type="button"
                  onClick={addEquipamento}
                  className="py-1 px-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Equipamento
                </button>
              )}
            </div>

            {equipamentos.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                Nenhum equipamento registrado hoje.
              </div>
            ) : (
              <div className="space-y-2">
                {equipamentos.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Equipamento</label>
                      <input
                        type="text"
                        disabled={!isEditor}
                        value={item.nome}
                        onChange={(e) => {
                          const updated = [...equipamentos];
                          updated[index].nome = e.target.value;
                          setEquipamentos(updated);
                        }}
                        placeholder="Ex: Bomba de Concreto, Betoneira 400L"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Qtd.</label>
                      <input
                        type="number"
                        min="1"
                        disabled={!isEditor}
                        value={item.quantidade}
                        onChange={(e) => {
                          const updated = [...equipamentos];
                          updated[index].quantidade = Math.max(1, Number(e.target.value));
                          setEquipamentos(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 text-center"
                      />
                    </div>

                    <div className="w-36">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Status</label>
                      <select
                        disabled={!isEditor}
                        value={item.status}
                        onChange={(e) => {
                          const updated = [...equipamentos];
                          updated[index].status = e.target.value as any;
                          setEquipamentos(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        <option value="Operando">Operando</option>
                        <option value="Parado">Parado</option>
                        <option value="Manutenção">Manutenção</option>
                      </select>
                    </div>

                    {isEditor && (
                      <button
                        type="button"
                        onClick={() => removeEquipamento(index)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors mt-3 sm:mt-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MATERIAIS */}
        {activeTab === 'materiais' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" /> Materiais e Insumos
                </h4>
                <p className="text-[11px] text-slate-400">Controle de cimento, aço, blocos, areia e entregas</p>
              </div>

              {isEditor && (
                <button
                  type="button"
                  onClick={addMaterial}
                  className="py-1 px-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Material
                </button>
              )}
            </div>

            {materiais.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                Nenhum material recebido ou utilizado registrado hoje.
              </div>
            ) : (
              <div className="space-y-2">
                {materiais.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Descrição do Material</label>
                      <input
                        type="text"
                        disabled={!isEditor}
                        value={item.descricao}
                        onChange={(e) => {
                          const updated = [...materiais];
                          updated[index].descricao = e.target.value;
                          setMateriais(updated);
                        }}
                        placeholder="Ex: Cimento CP-II, Concreto Usinado fck 30"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>

                    <div className="w-36">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Quantidade / Unidade</label>
                      <input
                        type="text"
                        disabled={!isEditor}
                        value={item.quantidade}
                        onChange={(e) => {
                          const updated = [...materiais];
                          updated[index].quantidade = e.target.value;
                          setMateriais(updated);
                        }}
                        placeholder="Ex: 50 sacos, 8 m³"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 text-center"
                      />
                    </div>

                    <div className="w-32">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Tipo</label>
                      <select
                        disabled={!isEditor}
                        value={item.tipo}
                        onChange={(e) => {
                          const updated = [...materiais];
                          updated[index].tipo = e.target.value as any;
                          setMateriais(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        <option value="Recebido">Recebido</option>
                        <option value="Utilizado">Utilizado</option>
                      </select>
                    </div>

                    {isEditor && (
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors mt-3 sm:mt-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: OCORRÊNCIAS E SEGURANÇA */}
        {activeTab === 'ocorrencias' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ocorrências e Imprevistos (Chuvas, Falta de Energia, Vistorias)
              </label>
              <textarea
                rows={3}
                disabled={!isEditor}
                value={ocorrencias}
                onChange={(e) => setOcorrencias(e.target.value)}
                placeholder="Ex: Paralisação de 1h devido à chuva forte. Retomada após drenagem..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Segurança do Trabalho, DDS e Acidentes
              </label>
              <textarea
                rows={3}
                disabled={!isEditor}
                value={seguranca}
                onChange={(e) => setSeguranca(e.target.value)}
                placeholder="Ex: DDS realizado às 07:00 com tema 'Trabalho em Altura'. Nenhum acidente registrado."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações Gerais e Notas Técnicas
              </label>
              <textarea
                rows={3}
                disabled={!isEditor}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Outras notas de fiscalização, ensaios de controle tecnológico ou recomendações..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        )}

        {/* TAB 7: FOTOS */}
        {activeTab === 'fotos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" /> Relatório Fotográfico de Campo
                </h4>
                <p className="text-[11px] text-slate-400">Adicione fotos tiradas diretamente pelo celular com legenda</p>
              </div>

              {isEditor && (
                <label className="cursor-pointer py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Carregar Fotos</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>

            {fotos.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center space-y-2">
                <Camera className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Nenhuma foto adicionada ainda.</p>
                <p className="text-[11px] text-slate-500">Tire fotos da evolução dos serviços para anexar ao PDF oficial.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fotos.map((foto) => (
                  <div key={foto.id} className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs">
                    <div className="h-40 bg-slate-900 relative">
                      <img src={foto.url} alt={foto.legenda} className="w-full h-full object-cover" />
                      {isEditor && (
                        <button
                          type="button"
                          onClick={() => removeFoto(foto.id)}
                          className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <input
                        type="text"
                        disabled={!isEditor}
                        value={foto.legenda}
                        onChange={(e) => {
                          const updated = fotos.map((f) => (f.id === foto.id ? { ...f, legenda: e.target.value } : f));
                          setFotos(updated);
                        }}
                        placeholder="Legenda da foto..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                      />
                      <span className="text-[10px] text-slate-500 block">{foto.dataHora}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: FINALIZAÇÃO E ASSINATURAS */}
        {activeTab === 'finalizar' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" /> Bloco de Assinaturas e Responsabilidade Técnica
              </h4>
              <p className="text-[11px] text-slate-400">
                Os dados abaixo serão impressos no rodapé de encerramento do PDF oficial do RDO.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assinatura / Nome do Responsável Técnico
                  </label>
                  <input
                    type="text"
                    disabled={!isEditor}
                    value={assinaturaResponsavel}
                    onChange={(e) => setAssinaturaResponsavel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fiscalização / Contratante
                  </label>
                  <input
                    type="text"
                    disabled={!isEditor}
                    value={assinaturaCliente}
                    onChange={(e) => setAssinaturaCliente(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Finalization Action Banner */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-slate-950 to-blue-950/40 border border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Pronto para concluir este Diário de Obra?</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Ao finalizar, o status passará para <strong>Finalizado</strong>, e o PDF gerado será salvo no repositório de documentos da obra.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isEditor && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave('Finalizado')}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{saving ? 'Finalizando...' : 'Finalizar RDO e Gerar PDF'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            const curIdx = tabs.findIndex((t) => t.id === activeTab);
            if (curIdx > 0) setActiveTab(tabs[curIdx - 1].id as any);
          }}
          disabled={activeTab === 'identificacao'}
          className="py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <div className="flex items-center gap-2">
          {activeTab !== 'finalizar' ? (
            <button
              type="button"
              onClick={() => {
                const curIdx = tabs.findIndex((t) => t.id === activeTab);
                if (curIdx < tabs.length - 1) setActiveTab(tabs[curIdx + 1].id as any);
              }}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
            >
              Concluir e Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
