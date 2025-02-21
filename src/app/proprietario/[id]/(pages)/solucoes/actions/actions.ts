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
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/tipos`);
  return response.data;
}

export async function getLinguagens() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/linguagens`);
  return response.data;
}

export async function getDesenvolvedores() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/desenvolvedores`);
  return response.data;
}

export async function getCategorias() {
    const storedId = localStorage.getItem('selectedProprietarioId');
    if (!storedId) {
        throw new Error("ProprietarioId not found in localStorage");
    }
    const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/categorias`);
    return response.data;
}

export async function getStatus() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/status`);
  return response.data;
}

export async function getResponsaveis() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/responsaveis`);
  return response.data;
} 

export async function getHistoricoSolucoes() {
    const response = await axios.get(`${urlSelect}/historico_solucoes`);
    return response.data;
}
