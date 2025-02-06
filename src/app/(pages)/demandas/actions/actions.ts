import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/demandas`;

export async function getDemandas() {
  const response = await axios.get(url);
  return response.data;
}

export async function getDemandasById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createDemanda(demanda: any) {
  const response = await axios.post(`${url}`, demanda);
  return response.data;
}

export async function updateDemanda(id: string, demanda: any) {
  const response = await axios.put(`${url}/${id}`, demanda);
  return response.data;
}

export async function deleteDemanda(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}

//select aqui
const urlSelect = `${baseUrl}`;

export async function getProprietarios() {
    const response = await axios.get(`${urlSelect}/proprietarios`);
    return response.data;
}

export async function getAlinhamentos() {
    const response = await axios.get(`${urlSelect}/alinhamentos`);
    return response.data;
}

export async function getPrioridades() {
    const response = await axios.get(`${urlSelect}/prioridades`);
    return response.data;
}

export async function getResponsaveis() {
    const response = await axios.get(`${urlSelect}/responsaveis`);
    return response.data;
}

export async function getStatus() {
    const response = await axios.get(`${urlSelect}/status`);
    return response.data;
}

