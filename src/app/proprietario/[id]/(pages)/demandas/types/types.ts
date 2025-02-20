export interface DemandaType {
    id: string;
    sigla: string;
    nome: string;
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