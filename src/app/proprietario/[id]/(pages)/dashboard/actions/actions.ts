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
  try {
    // Usa a nova rota específica para o dashboard
    const response = await axios.get(`${url}/proprietarios/${storedId}/dashboard/demandas`);
    const demandas = response.data;
    
    // Get alinhamentos
    const alinhamentosResponse = await axios.get(`${url}/proprietarios/${storedId}/alinhamentos`);
    const alinhamentos = alinhamentosResponse.data;
    
    // Merge alinhamentos into demandas
    const demandasWithAlinhamentos = demandas.map((demanda: any) => ({
      ...demanda,
      alinhamento: alinhamentos.find((a: any) => a.id === demanda.alinhamentoId)
    }));
    
    return demandasWithAlinhamentos;
  } catch (error) {
    console.error('Error fetching demandas:', error);
    throw error;
  }
}

export async function getSolucoes() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
    throw new Error("ProprietarioId not found in localStorage");
  }

  try {
    // Usa a nova rota específica para o dashboard
    const response = await axios.get(`${url}/proprietarios/${storedId}/dashboard/solucoes`);
    return response.data;
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
  try {
    const response = await axios.get(`${url}/proprietarios/${storedId}/alinhamentos`);
    console.log('Alinhamentos response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching alinhamentos:', error);
    throw error;
  }
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

export async function getDesenvolvedores(){
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${url}/proprietarios/${storedId}/desenvolvedores`);
  return response.data;
}