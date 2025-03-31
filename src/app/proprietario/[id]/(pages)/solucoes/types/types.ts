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
}

export interface BaseType {
  id: number;
  nome: string;
  propriedade: string;
}

export interface Times {
  id: number;
  nome: string;
  funcao: string;
  dataInicio: string;
  dataFim: string;
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


export interface TimeFormData {
  nome: string;
  funcao: string;
  data_inicio: string;
  data_fim?: string;
  proprietario_id: number;
}