import api from '../../../../../../../../lib/api';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/times`;


export async function getResponsaveis(proprietarioId: string) {
  const response = await api.get(`${baseUrl}/proprietarios/${proprietarioId}/times`);
  return response.data;
}

export async function getResponsaveisById(id: string) {
  const response = await api.get(`${url}/${id}`);
  return response.data;
}

export async function createResponsavel(responsavel: any) {
  const response = await api.post(`${url}`, responsavel);
  return response.data;
}

export async function updateResponsavel(id: string, responsavel: any) {
  const response = await api.put(`${url}/${id}`, responsavel);
  return response.data;
}

export async function deleteResponsavel(id: string) {
  const response = await api.delete(`${url}/${id}`);
  return response.data;
}

