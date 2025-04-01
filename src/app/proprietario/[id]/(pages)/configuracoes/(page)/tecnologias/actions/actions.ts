import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/linguagens`;

export async function getLinguagens(proprietarioId: string) {
  const response = await axios.get(`${baseUrl}/proprietarios/${proprietarioId}/linguagens`);
  return response.data;
}

export async function getLinguagensById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createLinguagem(linguagem: any) {
  const response = await axios.post(`${url}`, linguagem);
  return response.data;
}

export async function updateLinguagem(id: string, linguagem: any) {
  const response = await axios.put(`${url}/${id}`, linguagem);
  return response.data;
}

export async function deleteLinguagem(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}

