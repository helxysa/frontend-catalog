import axios from 'axios';
import { DemandaType } from '../types/type';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getDemandas(): Promise<DemandaType[]> {
  try {
    const proprietarioId = localStorage.getItem('selectedProprietarioId');
    if (!proprietarioId) {
      throw new Error('Proprietário não selecionado');
    }

    const response = await axios.get(
      `${baseURL}/proprietarios/${proprietarioId}/relatorios/demandas`
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar demandas:', error);
    return [];
  }
}

export async function getDemandasById(id: string) {
  const response = await axios.get(`${baseURL}/demandas/${id}`);
  return response.data;
}

export async function createDemanda(demanda: any) {
  const response = await axios.post(`${baseURL}/demandas`, demanda);
  return response.data;
}

export async function updateDemanda(id: string, demanda: any) {
  const response = await axios.put(`${baseURL}/demandas/${id}`, demanda);
  return response.data;
}

export async function deleteDemanda(id: string) {
  const response = await axios.delete(`${baseURL}/demandas/${id}`);
  return response.data;
}




//select aqui
const urlSelect = `${baseURL}`;

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


