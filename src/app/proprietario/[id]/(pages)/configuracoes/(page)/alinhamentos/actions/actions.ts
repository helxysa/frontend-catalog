import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/alinhamentos`;

export async function getAlinhamentos() {
  const response = await axios.get(url);
  return response.data;
}

export async function getAlinhamentosById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createAlinhamento(alinhamento: any) {
  const response = await axios.post(`${url}`, alinhamento);
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

