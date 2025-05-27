export interface SolucaoType {
    id: number;
    nome: string;
    sigla: string;
    descricao: string;
    versao: string;
    repositorio: string;
    tipoId: number;
    link: string;
    andamento:string;
    criticidade: string;
    linguagemId: string | number | null;
    timeId: string | number | null;
    desenvolvedorId: number;
    categoriaId: number;
    responsavelId: number;
    statusId: number;
    demandaId: number;
    data_status?: string;
    dataStatus: string;
    createdAt: string;
    updatedAt: string;
    tipo?: { id: number; nome: string };
    desenvolvedor?: { id: number; nome: string };
    categoria?: { id: number; nome: string };
    responsavel?: { id: number; nome: string };
    status?: { id: number; nome: string; propriedade: string };
    demanda?: { 
      id: number; 
      nome: string; 
      fatorGerador: string;
      alinhamento?: { id: number; nome: string };
    };
    times?: {
      responsavel_id: number;
      funcao: string;
      dataInicio: string;
      dataFim: string;
    }[];
    atualizacoes?: {
      nome: string;
      descricao: string;
      data_atualizacao: string;
    };
}

export interface BaseType {
  id: number;
  nome: string;
  propriedade: string;
}



export interface SolucaoFormData {
  nome: string;
  sigla: string;
  descricao: string;
  versao: string;
  repositorio: string;
  link: string;
  andamento: string;
  criticidade: string;
  tipo_id: number | null;
  linguagem_id: string | number | null;
  desenvolvedor_id: number | null;
  categoria_id: number | null;
  responsavel_id: number | null;
  status_id: number | null;
  demanda_id: number | null;
  data_status: string | null;
  times: {
    id: number;
    responsavel_id: number;
    funcao: string;
    dataInicio: string;
    dataFim: string;
  }[];
  atualizacoes: {
    id: number;
    nome: string;
    descricao: string;
    data_atualizacao: string;
  }[];
}

export interface HistoricoType {
  id: number;
  solucaoId: number;
  usuario: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
  solucao: {
    id: number;
    nome: string;
    sigla: string;
    versao: string;
    repositorio: string;
    descricao: string;
    link: string;
    andamento:string;
    criticidade: string;
    tipoId: number;
    timesId: number;
    linguagemId: number;
    desenvolvedorId: number;
    categoriaId: number;
    responsavelId: number;
    statusId: number;
    demandaId: number;
    dataStatus: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface BaseType {
  id: number;
  nome: string;
  sigla?: string;
}






export interface SolucaoFormModalProps {
  isOpen: boolean;
  isEditing: string | null;
  formData: SolucaoFormData;
  setFormData: React.Dispatch<React.SetStateAction<SolucaoFormData>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string; } }) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onClose: () => void;
  tipos: BaseType[];
  linguagens: BaseType[];
  desenvolvedores: BaseType[];
  categorias: BaseType[];
  responsaveis: BaseType[];
  statusList: (BaseType & { propriedade: string })[];
  demanda: BaseType[];
  formErrors: { nome: boolean; demanda_id: boolean };
  selectedLanguages: number[];
  setSelectedLanguages: React.Dispatch<React.SetStateAction<number[]>>;
  handleLanguageChange: (e: React.ChangeEvent<HTMLSelectElement> | {target: { value: string }}) => void;
  removeLanguage: (langId: number) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeFormTab: string;
  setActiveFormTab: React.Dispatch<React.SetStateAction<string>>;
  times: {
    id: number;
    responsavel_id: number;
    funcao: string;
    dataInicio: string;
    dataFim: string;
  }[];
  atualizacoes: {
    id: number;
    nome: string;
    descricao: string;
    data_atualizacao: string;
  }[];
  formatDate: (dateString?: string | null) => string;
  selectedAtualizacaoId: string | null;
  setSelectedAtualizacaoId: React.Dispatch<React.SetStateAction<string | null>>;
}