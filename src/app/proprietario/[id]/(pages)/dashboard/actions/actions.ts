import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}`;

export async function getTipos() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${url}/proprietarios/${storedId}/tipos`);
  return response.data;
}

export async function getDemandas() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${url}/proprietarios/${storedId}/demandas/`);
  console.log('Dados brutos das demandas:', response.data);
  return response.data;
}

export async function getSolucoes() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }

  try {
    // Primeiro, busca todas as demandas do proprietário
    const demandasResponse = await axios.get(`${url}/proprietarios/${storedId}/demandas`);
    const demandas = demandasResponse.data;
    
    // Depois, busca todas as soluções
    const solucoesResponse = await axios.get(`${url}/solucoes`);
    const solucoes = solucoesResponse.data;
    
    // Adiciona logs para debug
    console.log('Demandas:', demandas);
    console.log('Soluções:', solucoes);
    
    // Filtra as soluções, garantindo que os IDs sejam comparados como números
    const solucoesFiltradas = solucoes.filter((solucao: any) => {
      const solucaoDemandaId = Number(solucao.demanda?.id || solucao.demanda_id);
      return demandas.some((demanda: any) => Number(demanda.id) === solucaoDemandaId);
    });

    console.log('Soluções Filtradas:', solucoesFiltradas);
    return solucoesFiltradas;
  } catch (error) {
    console.error('Erro ao buscar soluções:', error);
    throw error;
  }
}

export async function getAlinhamentos() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${url}/proprietarios/${storedId}/alinhamentos`);
  return response.data;
}

export async function getStatus() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${url}/proprietarios/${storedId}/status`);
  return response.data;
}

export async function getCategorias() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${url}/proprietarios/${storedId}/categorias`);
  return response.data;
}

