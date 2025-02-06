import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/prioridades`;

export async function getPrioridades() {
  const response = await axios.get(url);
  return response.data;
}

export async function getPrioridadesById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createPrioridade(prioridade: any) {
  const response = await axios.post(`${url}`, prioridade);
  return response.data;
}

export async function updatePrioridade(id: string, prioridade: any) {
  const response = await axios.put(`${url}/${id}`, prioridade);
  return response.data;
}

export async function deletePrioridade(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}

