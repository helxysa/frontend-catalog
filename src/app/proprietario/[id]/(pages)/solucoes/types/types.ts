export interface SolucaoType {
  id: number | null;
  nome: string;
  proprietario_id: number | null;
  sigla: string;
  descricao: string;
  versao: string;
  repositorio: string;
  tipoId: number | null;
  link: string;
  andamento: string;
  criticidade: string;
  linguagemId: string | number | null;
  timeId: string | number | null;
  desenvolvedorId: number | null;
  categoriaId: number | null;
  responsavelId: number | null;
  statusId: number | null;
  demandaId: number | null;
  data_status?: string;
  dataStatus: string;
  createdAt: string;
  updatedAt: string;
  tipo?: { id: number | null; nome: string };
  desenvolvedor?: { id: number | null; nome: string };
  categoria?: { id: number | null; nome: string };
  responsavel?: { id: number | null; nome: string };
  status?: { id: number | null; nome: string; propriedade: string };
  demanda?: {
    id: number | null;
    nome: string;
    fatorGerador: string;
    alinhamento?: { id: number | null; nome: string };
  };
  times?: {
    responsavel_id: number | null;
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
