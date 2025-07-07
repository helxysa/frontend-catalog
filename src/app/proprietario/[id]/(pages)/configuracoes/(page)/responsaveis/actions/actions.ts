import api from '../../../../../../../../lib/api';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/responsaveis`;


export async function getDesenvolvedores(proprietarioId: string, page: number, limit: number) {
  const response = await api.get(`${baseUrl}/proprietarios/${proprietarioId}/responsaveis?page=${page}&limit=${limit}`);
  return response.data;
}

export async function getDesenvolvedoresById(id: string) {
  const response = await api.get(`${url}/${id}`);
  return response.data;
}

export async function createDesenvolvedor(desenvolvedor: any) {
  const response = await api.post(`${url}`, desenvolvedor);
  return response.data;
}

export async function updateDesenvolvedor(id: string, desenvolvedor: any) {
  const response = await api.put(`${url}/${id}`, desenvolvedor);
  return response.data;
}

export async function deleteDesenvolvedor(id: string) {
  const response = await api.delete(`${url}/${id}`);
  return response.data;
}

