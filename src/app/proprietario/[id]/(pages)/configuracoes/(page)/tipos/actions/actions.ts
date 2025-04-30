import api from '../../../../actions/api';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/tipos`;

export async function getTipos(proprietarioId: string) {
  const response = await api.get(`${baseUrl}/proprietarios/${proprietarioId}/tipos`);
  return response.data;
}


export async function getTiposById(id: string) {
  const response = await api.get(`${url}/${id}`);
  return response.data;
}

export async function createTipo(tipo: any) {
  const response = await api.post(`${url}`, tipo);
  return response.data;
}

export async function updateTipo(id: string, tipo: any) {
  const response = await api.put(`${url}/${id}`, tipo);
  return response.data;
}

export async function deleteTipo(id: string) {
  const response = await api.delete(`${url}/${id}`);
  return response.data;
}

