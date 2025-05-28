import api from '../../../../../../../../lib/api';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/prioridades`;

export async function getPrioridades(proprietarioId: string) {
  const response = await api.get(`${baseUrl}/proprietarios/${proprietarioId}/prioridades`);
  return response.data;
}

export async function getPrioridadesById(id: string) {
  const response = await api.get(`${url}/${id}`);
  return response.data;
}

export async function createPrioridade(prioridade: any) {
  const response = await api.post(`${url}`, prioridade);
  return response.data;
}

export async function updatePrioridade(id: string, prioridade: any) {
  const response = await api.put(`${url}/${id}`, prioridade);
  return response.data;
}

export async function deletePrioridade(id: string) {
  const response = await api.delete(`${url}/${id}`);
  return response.data;
}

