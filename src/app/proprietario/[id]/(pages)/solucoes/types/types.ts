export interface SolucaoType {
    id: number;
    nome: string;
    sigla: string;
    descricao: string;
    versao: string;
    linguagem_id: string | null;
    tipo: {
      id: number;
      nome: string;
    } | null;
    desenvolvedor: {
      id: number;
      nome: string;
    } | null;
    categoria: {
      id: number;
      nome: string;
    } | null;
    responsavel: {
      id: number;
      nome: string;
    } | null;
    status: {
      id: number;
      nome: string;
      propriedade: string;
    } | null;
    demanda: {
      id: number;
      nome: string;
    } | null;
    dataStatus: string;
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
  tipo_id: number | null;
  linguagem_id: string | null;
  desenvolvedor_id: number | null;
  categoria_id: number | null;
  responsavel_id: number | null;
  status_id: number | null;
  demanda_id: number | null;
}

