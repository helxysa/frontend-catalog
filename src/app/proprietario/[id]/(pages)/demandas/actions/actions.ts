import api from '../../../../../../lib/api';
import { revalidatePath } from "next/cache";


const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
const url = '/demandas';



export async function getDemandas(proprietarioId: string | number, page: number = 1, limit: number = 10) {
  if (!proprietarioId) {
    console.log("ID do proprietário não fornecido.");
    return { data: [], meta: { total: 0, perPage: limit, currentPage: page, lastPage: 1 } };
  }
  try {
    const response = await api.get(`/demandas/busca/${proprietarioId}?page=${page}&limit=${limit}`);
    return response.data; 
  } catch (err: any) {
    if (err.isAxiosError && err.response && err.response.status === 404) {
      return { data: [], meta: { total: 0, perPage: limit, currentPage: page, lastPage: 1 } };
    }
    console.error("Erro ao buscar demandas no servidor:", err);
    return { data: [], meta: { total: 0, perPage: limit, currentPage: page, lastPage: 1 } };
  }
}

export async function deleteDemandaAction(id: number) {
  try {
    await api.delete(`${url}/${id}`);

    revalidatePath("/demandas"); 

    return { success: true, message: "Demanda deletada com sucesso!" };
  } catch (error) {
    return { success: false, message: "Erro ao deletar a demanda." };
  }
}

export async function getDemandasById(id: string) {
  try {
    const response = await api.get(`${url}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching demanda by ID:", error);
    return null;
  }
}

export async function createDemanda(demanda: any) {
  try {
    const response = await api.post(`${url}`, demanda);
    return response.data;
  } catch (error) {
    console.error("Error creating demanda:", error);
    return null;
  }
}

export async function updateDemanda(id: string, demanda: any) {
  try {
    const response = await api.put(`${url}/${id}`, demanda);
    return response.data;
  } catch (error) {
    console.error("Error updating demanda:", error);
    return null;
  }
}

export async function deleteDemanda(id: string) {
  try {
    const response = await api.delete(`${url}/${id}`);
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
    const response = await api.get('/proprietarios');
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
    const response = await api.get(`${urlSelect}/proprietarios/${storedId}/alinhamentos?page=1&limit=100`);
    return response.data.data;
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
    const response = await api.get(`${urlSelect}/proprietarios/${storedId}/prioridades?page=1&limit=100`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching prioridades:", error);
    return null;
  }
}

export async function getSolucoesByDemandaId(demandaId: string) {
  try {
    const response = await api.get(`${baseUrl}/solucoes?demanda_id=${demandaId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching solutions:", error);
    return [];
  }
}


export async function getResponsaveis() {
  try {
    const storedId = localStorage.getItem('selectedProprietarioId');
    if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
    }
    const response = await api.get(`${urlSelect}/proprietarios/${storedId}/responsaveis?page=1&limit=100`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching responsaveis:", error);
    return null;
  }
}

export async function getHistoricoByDemandaId(demandaId: number) {
  if (!demandaId) {
    console.error("ID da demanda não fornecido para buscar histórico.");
    return [];
  }
  try {
    const response = await api.get(`/demandas/${demandaId}/historico`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar histórico da demanda:", error);
    return [];
  }
}

export async function getHistoricoDemandas() {
  try {
    const response = await api.get(`${urlSelect}/historico_demandas`);
    return response.data;
  } catch (error) {
    console.error("Error fetching historico demandas:", error);
    return null;
  }
}