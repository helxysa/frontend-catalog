import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/desenvolvedores`;

export async function getDesenvolvedores() {
  const response = await axios.get(url);
  return response.data;
}

export async function getDesenvolvedoresById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createDesenvolvedor(desenvolvedor: any) {
  const response = await axios.post(`${url}`, desenvolvedor);
  return response.data;
}

export async function updateDesenvolvedor(id: string, desenvolvedor: any) {
  const response = await axios.put(`${url}/${id}`, desenvolvedor);
  return response.data;
}

export async function deleteDesenvolvedor(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}

