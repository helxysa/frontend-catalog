import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/categorias`;

export async function getCategorias(proprietarioId?: string) {
  if (proprietarioId) {
    const response = await axios.get(`${baseUrl}/proprietarios/${proprietarioId}/categorias`);
    return response.data;
  }
  const response = await axios.get(url);
  return response.data;
}

export async function getCategoriasById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createCategoria(categoria: any) {
  const payload = {
    nome: categoria.nome,
    descricao: categoria.descricao,
    proprietario_id: Number(categoria.proprietario_id)
  };
  
  const response = await axios.post(url, payload);
  return response.data;
}

export async function updateCategoria(id: string, categoria: any) {
  const response = await axios.put(`${url}/${id}`, {
    ...categoria,
    proprietario_id: categoria.proprietario_id
  });
  return response.data;
}

export async function deleteCategoria(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}

