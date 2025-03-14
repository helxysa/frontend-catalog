export interface SolucaoType {
    id: number;
    nome: string;
    sigla: string;
    descricao: string;
    versao: string;
    repositorio: string;
    tipoId: number;
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
    demanda?: { id: number; nome: string, fatorGerador: string };
}

export interface BaseType {
  id: number;
  nome: string;
  propriedade: string;
}

export interface Times  {
  id: number;
  nome: string;
  funcao: string;
  descricao: string;
}

export interface SolucaoFormData {
  nome: string;
  sigla: string;
  descricao: string;
  versao: string;
  repositorio: string;
  tipo_id: number | null;
  linguagem_id: string | number | null;
  desenvolvedor_id: number | null;
  categoria_id: number | null;
  responsavel_id: number | null;
  status_id: number | null;
  demanda_id: number | null;
  data_status: string | null;
}

