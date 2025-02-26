export interface DemandaType {
    id: string;
    sigla: string;
    nome: string;
    createdAt: string | Date;
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
  }

  export interface DemandaFormData {
    proprietario_id: number;
    nome: string;
    sigla: string;
    descricao: string;
    demandante: string;
    fator_gerador: string;
    alinhamento_id: number;
    prioridade_id: number;
    responsavel_id: number;
    status_id: number;
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