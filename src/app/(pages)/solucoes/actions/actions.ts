import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/solucoes`;

export async function getSolucoes() {
  const response = await axios.get(url);
  return response.data;
}

export async function getSolucaoById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createSolucao(solucao: any) {
  const response = await axios.post(`${url}`, solucao);
  return response.data;
}

export async function updateSolucao(id: string, solucao: any) {
  const response = await axios.put(`${url}/${id}`, solucao);
  return response.data;
}

export async function deleteSolucao(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}


//select aqui
const urlSelect = `${baseUrl}`;

export async function getDemandas() {
    const response = await axios.get(`${urlSelect}/demandas`);
    return response.data;
}

export async function getTipos() {
    const response = await axios.get(`${urlSelect}/tipos`);
    return response.data;
}

export async function getLinguagens() {
    const response = await axios.get(`${urlSelect}/linguagens`);
    return response.data;
}

export async function getDesenvolvedores() {
    const response = await axios.get(`${urlSelect}/desenvolvedores`);
    return response.data;
}

export async function getCategorias() {
    const response = await axios.get(`${urlSelect}/categorias`);
    return response.data;
}

export async function getStatus() {
    const response = await axios.get(`${urlSelect}/status`);
    return response.data;
}

export async function getResponsaveis() {
    const response = await axios.get(`${urlSelect}/responsaveis`);
    return response.data;
}   

export async function getHistoricoSolucoes() {
    const response = await axios.get(`${urlSelect}/historico_solucoes`);
    return response.data;
}
