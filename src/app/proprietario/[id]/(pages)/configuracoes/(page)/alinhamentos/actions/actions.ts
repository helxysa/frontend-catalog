import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/alinhamentos`;

export async function getAlinhamentos(proprietarioId: string) {
  const response = await axios.get(`${baseUrl}/proprietarios/${proprietarioId}/alinhamentos`);
  return response.data;
}

export async function getAlinhamentosById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

interface AlinhamentoCreate {
  nome: string;
  descricao: string;
  proprietario_id: number;
}

export async function createAlinhamento(alinhamento: AlinhamentoCreate) {
  const response = await axios.post(`${url}`, {
    nome: alinhamento.nome,
    descricao: alinhamento.descricao,
    proprietario_id: alinhamento.proprietario_id
  });
  return response.data;
}

export async function updateAlinhamento(id: string, alinhamento: any) {
  const response = await axios.put(`${url}/${id}`, alinhamento);
  return response.data;
}

export async function deleteAlinhamento(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}

