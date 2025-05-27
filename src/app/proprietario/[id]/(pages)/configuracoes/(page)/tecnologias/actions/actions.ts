import api from '../../../../../../../../lib/api';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/linguagens`;

export async function getLinguagens(proprietarioId: string) {
  const response = await api.get(`${baseUrl}/proprietarios/${proprietarioId}/linguagens`);
  return response.data;
}

export async function getLinguagensById(id: string) {
  const response = await api.get(`${url}/${id}`);
  return response.data;
}

export async function createLinguagem(linguagem: any) {
  const response = await api.post(`${url}`, linguagem);
  return response.data;
}

export async function updateLinguagem(id: string, linguagem: any) {
  const response = await api.put(`${url}/${id}`, linguagem);
  return response.data;
}

export async function deleteLinguagem(id: string) {
  const response = await api.delete(`${url}/${id}`);
  return response.data;
}

