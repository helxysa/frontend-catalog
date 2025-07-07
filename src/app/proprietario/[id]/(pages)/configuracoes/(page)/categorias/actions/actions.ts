import api from '../../../../../../../../lib/api';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}

export async function getCategorias(proprietarioId: string, page: number, limit: number) {
  const response = await api.get(`${baseUrl}/proprietarios/${proprietarioId}/categorias?page=${page}&limit=${limit}`);
  return response.data;
}

export async function getCategoriaById(id: string) {
  const response = await api.get(`${baseUrl}/categorias/${id}`);
  return response.data;
}

export async function createCategoria(categoria: any) {
  const response = await api.post(`${baseUrl}/categorias`, categoria);
  return response.data;
}

export async function updateCategoria(id: string, categoria: any) {
  const response = await api.put(`${baseUrl}/categorias/${id}`, categoria);
  return response.data;
}

export async function deleteCategoria(id: string) {
  const response = await api.delete(`${baseUrl}/categorias/${id}`);
  return response.data;
}

