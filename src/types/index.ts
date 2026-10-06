export type UserRole = 'Editor' | 'Visualizador';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ObraStatus = 'Em Andamento' | 'Concluída' | 'Paralisada' | 'Planejada';

export interface Obra {
  id: string;
  codigo: string;
  nome: string;
  cliente: string;
  endereco: string;
  responsavelTecnico: string;
  creaCau: string;
  dataInicio: string;
  terminoPrevisto: string;
  status: ObraStatus;
  percentualAvanco: number;
  googleDriveFolderId?: string;
  googleDriveFolderName?: string;
  googleDriveUrl?: string;
  companyId?: string;
  createdBy: string;
  createdAt: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  contato: string;
  responsavelTecnico: string;
  creaCau: string;
  createdBy: string;
  createdAt: string;
}

export type FuncaoEquipe =
  | 'Engenheiro'
  | 'Mestre de Obras'
  | 'Encarregado'
  | 'Estagiário'
  | 'Técnico de Segurança'
  | 'Topógrafo'
  | 'Almoxarife'
  | 'Outro';

export interface EquipeMembro {
  id: string;
  nome: string;
  funcao: FuncaoEquipe;
  obraId: string;
  telefone: string;
  email: string;
  empresaNome: string;
  status: 'Ativo' | 'Inativo';
  createdBy: string;
  createdAt: string;
}

export type ClimaPeriodo = 'Bom' | 'Nublado' | 'Chuvoso' | 'Impraticável';

export interface CondicoesClimaticas {
  manha: ClimaPeriodo;
  tarde: ClimaPeriodo;
  noite: ClimaPeriodo;
}

export interface MaoDeObraItem {
  funcao: string;
  quantidade: number;
  empresa?: string;
  requerConfirmacao?: boolean;
}

export interface EquipamentoItem {
  nome: string;
  quantidade: number;
  status: 'Operando' | 'Parado' | 'Manutenção';
  requerConfirmacao?: boolean;
}

export interface MaterialItem {
  descricao: string;
  quantidade: string;
  tipo: 'Recebido' | 'Utilizado';
  requerConfirmacao?: boolean;
}

export interface FotoItem {
  id: string;
  url: string;
  legenda: string;
  dataHora: string;
}

export type RdoStatus = 'Rascunho' | 'Finalizado';

export interface AtividadeChecklistItem {
  id: string;
  descricao: string;
  concluida: boolean;
  status?: 'Concluído' | 'Em Andamento' | 'Iniciado' | 'Pendente';
  local?: string;
}

export interface RDO {
  id: string;
  numero: number;
  obraId: string;
  obraNome: string;
  data: string; // DD/MM/AAAA
  responsavel: string;
  responsavelId: string;
  condicoesClimaticas: CondicoesClimaticas;
  etapasFrentes: string;
  etapa?: string;
  frenteServico?: string;
  local?: string;
  atividadesExecutadas: string;
  atividadesChecklist?: AtividadeChecklistItem[];
  percentualAvanco?: number;
  maoDeObra: MaoDeObraItem[];
  equipamentos: EquipamentoItem[];
  materiais: MaterialItem[];
  ocorrencias: string;
  seguranca: string;
  observacoes: string;
  fotos: FotoItem[];
  status: RdoStatus;
  pdfUrl?: string;
  googleDriveFileId?: string;
  assinaturaResponsavel?: string;
  assinaturaCliente?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentoTipo = 'RDO_PDF' | 'FOTO' | 'PLANTA' | 'RELATORIO' | 'OUTRO';

export interface DocumentoItem {
  id: string;
  obraId: string;
  titulo: string;
  tipo: DocumentoTipo;
  arquivoUrl: string;
  tamanho: string;
  dataUpload: string;
  criadoPor: string;
  createdBy: string;
  createdAt: string;
  googleDriveFileId?: string;
}

export interface StructuredAiExtraction {
  transcricao?: string;
  climaManha?: string;
  climaTarde?: string;
  climaNoite?: string;
  etapasFrentes?: string;
  etapa?: string;
  frenteServico?: string;
  local?: string;
  atividadesExecutadas?: string;
  atividadesChecklist?: AtividadeChecklistItem[];
  percentualAvanco?: number | null;
  maoDeObra?: MaoDeObraItem[];
  equipamentos?: EquipamentoItem[];
  materiais?: MaterialItem[];
  ocorrencias?: string;
  seguranca?: string;
  observacoes?: string;
  avisos?: string[];
}
