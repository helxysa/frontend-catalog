export interface Demanda {
  id: number;
  nome: string;
  sigla: string;
  descricao: string;
  fatorGerador: string;
  demandante: string;
  dataStatus: string;
  link?: string;
  alinhamento: {
      nome: string;
  } | null;
  prioridade: {
    nome: string;
} | null;
responsavel: {
  nome: string;
} | null;
status: {
  nome: string;
  propriedade?: string;
} | null;
data_status: {
  nome: string;
} | null;
created_at: {
  nome: string;
} | null;    

}

export interface PaginatedResponse {
  data: Demanda[];
  meta: any;
}