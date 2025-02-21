import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}

export async function getCategorias(proprietarioId: string) {
  const response = await axios.get(`${baseUrl}/proprietarios/${proprietarioId}/categorias`);
  return response.data;
}

export async function getCategoriaById(id: string) {
  const response = await axios.get(`${baseUrl}/categorias/${id}`);
  return response.data;
}

export async function createCategoria(categoria: any) {
  const response = await axios.post(`${baseUrl}/categorias`, categoria);
  return response.data;
}

export async function updateCategoria(id: string, categoria: any) {
  const response = await axios.put(`${baseUrl}/categorias/${id}`, categoria);
  return response.data;
}

export async function deleteCategoria(id: string) {
  const response = await axios.delete(`${baseUrl}/categorias/${id}`);
  return response.data;
}

