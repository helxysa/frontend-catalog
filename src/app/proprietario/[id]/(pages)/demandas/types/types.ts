export interface DemandaType {
    id: string;
    sigla: string;
    nome: string;
    createdAt: string | Date;
    link: string
    status: {
      id: number;
      nome: string;
      propriedade: string;
    };
    proprietario: {
      id: number;
      nome: string;
    };
    descricao: string;
    propriedade: string;
    demandante: string;
    fatorGerador: string;
    alinhamento: {
      id: number;
      nome: string;
    };
    prioridade: {
      id: number;
      nome: string;
    };
    responsavel: {
      id: number;
      nome: string;
    };
    dataStatus: string;
    solucoes?: any[];
  }

  export interface DemandaFormData {
    proprietario_id: number;
    nome: string;
    sigla: string;
    descricao: string;
    demandante: string;
    link: string;
    fator_gerador: string;
    alinhamento_id: number | null;
    prioridade_id: number | null;
    responsavel_id: number | null;
    status_id: number | null;
    data_status: string;
  }
  
  export interface HistoricoType {
    id: number;
    demandaId: number;
    usuario: string;
    descricao: string;
    createdAt: string;
    updatedAt: string;
    demanda: {
      id: number;
      nome: string;
      proprietarioId: number;
      sigla: string;
      descricao: string;
      link: string
      demandante: string;
      fatorGerador: string;
      alinhamentoId: number;
      prioridadeId: number;
      responsavelId: number;
      statusId: number;
      dataStatus: string;
      createdAt: string;
      updatedAt: string;
    };
  }
  
  export interface AlinhamentoType {
    id: number;
    nome: string;
  }
  
  export interface PrioridadeType {
    id: number;
    nome: string;
  }
  
  export interface StatusType {
    id: number;
    nome: string;
  }
  
  export interface ProprietarioType {
    id: number;
    nome: string;
  }
  
  export interface ResponsavelType {
    id: number;
    nome: string;
  }