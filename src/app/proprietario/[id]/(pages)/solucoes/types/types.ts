export interface SolucaoType {
    id: string;
    sigla: string;
    nome: string;
    descricao: string;
    createdAt: string | Date;
    proprietario_id: number;
    versao: string;
    tipo?: {
      id: number;
      nome: string;
    };
    status: {
      id: number;
      nome: string;
      propriedade: string;
    };
    proprietario: {
      id: number;
      nome: string;
    };
    desenvolvedor: {
      id: number;
      nome: string;
    };
    categoria: {
      id: number;
      nome: string;
    };
    demanda: {
      id: number;
      nome: string;
    };
    propriedade: string;
    demandante: string;
    responsavel: {
      id: number;
      nome: string;
    };
    dataStatus: string;
    linguagem?: {
      id: number;
      nome: string;
    };
  }

