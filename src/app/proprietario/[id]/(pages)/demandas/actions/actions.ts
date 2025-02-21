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
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/alinhamentos`);
  return response.data;
}


export async function getPrioridades() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/prioridades`);
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


export async function getStatus() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/status`);
  return response.data;
}


export async function getHistoricoDemandas() {
    const response = await axios.get(`${urlSelect}/historico_demandas`);
    return response.data;
}


