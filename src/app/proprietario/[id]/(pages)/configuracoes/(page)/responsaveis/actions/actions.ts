import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/responsaveis`;

export async function getResponsaveis() {
  const response = await axios.get(url);
  return response.data;
}

export async function getResponsaveisById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createResponsavel(responsavel: any) {
  const response = await axios.post(`${url}`, responsavel);
  return response.data;
}

export async function updateResponsavel(id: string, responsavel: any) {
  const response = await axios.put(`${url}/${id}`, responsavel);
  return response.data;
}

export async function deleteResponsavel(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}

