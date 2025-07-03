import api from '../../../../../../lib/api';
import { revalidatePath } from "next/cache";


const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
const url = '/demandas';



export async function getDemandas(proprietarioId: string | number) {
  if (!proprietarioId) {
    console.log("ID do proprietário não fornecido.");
    return [];
  }
  try {
    const response = await api.get(`/demandas/busca/${proprietarioId}?page=1&limit=10`);
    return response.data; 
  } catch (err) {
    console.error("Erro ao buscar demandas no servidor:", err);
    return [];
  }
}

// 2. AÇÃO PARA DELETAR (JÁ PREPARADA PARA O FUTURO)
export async function deleteDemandaAction(id: number) {
  try {
    await api.delete(`${url}/${id}`);

    // Invalida o cache da rota principal para forçar a atualização dos dados
    revalidatePath("/demandas"); // Coloque aqui a rota da sua página

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
    const response = await api.get(`${urlSelect}/proprietarios/${storedId}/alinhamentos`);
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
    const response = await api.get(`${urlSelect}/proprietarios/${storedId}/prioridades`);
    return response.data;
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
    const response = await api.get(`${urlSelect}/proprietarios/${storedId}/responsaveis`);
    return response.data;
  } catch (error) {
    console.error("Error fetching responsaveis:", error);
    return null;
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





