import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/demandas`;

export async function getDemandas(page?: number, limit?: number, showAll?: boolean) {
  try {
    const params = new URLSearchParams();
    
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (showAll !== undefined) params.append('showAll', showAll.toString());
    
    const queryString = params.toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;
    
    const response = await axios.get(finalUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching demandas:", error);
    return null;
  }
}

export async function getDemandasById(id: string) {
  try {
    const response = await axios.get(`${url}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching demanda by ID:", error);
    return null;
  }
}

export async function createDemanda(demanda: any) {
  try {
    const response = await axios.post(`${url}`, demanda);
    return response.data;
  } catch (error) {
    console.error("Error creating demanda:", error);
    return null;
  }
}

export async function updateDemanda(id: string, demanda: any) {
  try {
    const response = await axios.put(`${url}/${id}`, demanda);
    return response.data;
  } catch (error) {
    console.error("Error updating demanda:", error);
    return null;
  }
}

export async function deleteDemanda(id: string) {
  try {
    const response = await axios.delete(`${url}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting demanda:", error);
    return null;
  }
}




//select aqui
const urlSelect = `${baseUrl}`;

export async function getProprietarios() {
  try {
    const response = await axios.get(`${urlSelect}/proprietarios`);
    return response.data;
  } catch (error) {
    console.error("Error fetching proprietarios:", error);
    return null;
  }
}

export async function getAlinhamentos() {
  try {
    const storedId = localStorage.getItem('selectedProprietarioId');
    if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
    }
    const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/alinhamentos`);
    return response.data;
  } catch (error) {
    console.error("Error fetching alinhamentos:", error);
    return null;
  }
}


export async function getPrioridades() {
  try {
    const storedId = localStorage.getItem('selectedProprietarioId');
    if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
    }
    const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/prioridades`);
    return response.data;
  } catch (error) {
    console.error("Error fetching prioridades:", error);
    return null;
  }
}


export async function getResponsaveis() {
  try {
    const storedId = localStorage.getItem('selectedProprietarioId');
    if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
    }
    const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/responsaveis`);
    return response.data;
  } catch (error) {
    console.error("Error fetching responsaveis:", error);
    return null;
  }
}


export async function getStatus() {
  try {
    const storedId = localStorage.getItem('selectedProprietarioId');
    if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
    }
    const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching status:", error);
    return null;
  }
}


export async function getHistoricoDemandas() {
  try {
    const response = await axios.get(`${urlSelect}/historico_demandas`);
    return response.data;
  } catch (error) {
    console.error("Error fetching historico demandas:", error);
    return null;
  }
}


