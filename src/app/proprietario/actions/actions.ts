import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/proprietarios`;

export async function getProprietario() {
  const response = await axios.get(url);
  return response.data;
}

export async function getProprietarioById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createProprietario(proprietario: any) {
  const response = await axios.post(`${url}`, proprietario);
  return response.data;
}

export async function updateProprietario(id: string, proprietario: any) {
  const response = await axios.put(`${url}/${id}`, proprietario);
  return response.data;
}

export async function deleteProprietario(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}

