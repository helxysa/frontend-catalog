import axios from 'axios';
import api from '../../actions/api';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/solucoes`;

export const getSolucoes = async (page: number, itemsPerPage: number, proprietarioId: number) => {
  try {
    const response = await api.get(`${baseUrl}/proprietarios/${proprietarioId}/solucoes`, {
      params: {
        page,
        itemsPerPage,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching soluções:', error);
    return null;
  }
};

export async function getSolucaoById(id: string) {
    try {
        const response = await api.get(`${url}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching solution by ID:", error);
        return null;
    }
}

export async function createSolucao(solucao: any) {
    try {
        const response = await api.post(`${url}`, solucao);
        return response.data;
    } catch (error) {
        console.error("Error creating solution:", error);
        return null;
    }
}

export async function updateSolucao(id: string, solucao: any) {
    try {
      const response = await api.put(`${url}/${id}`, solucao, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating solution:", error);
      throw error; // Lançar o erro para que ele seja tratado no handleSubmit
    }
  }

export async function deleteSolucao(id: string) {
    try {
        const response = await api.delete(`${url}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting solution:", error);
        return null;
    }
}


//select aqui
const urlSelect = `${baseUrl}`;

export async function getAllDemandas() {
    try {
        const response = await api.get(`${urlSelect}/demandas/all`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all demands:", error);
        return null;
    }
}

export async function getDemandas(page: number = 1, limit: number = 8) {
    try {
        const response = await api.get(`${urlSelect}/demandas?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching demands:", error);
        return null;
    }
}

export async function getTipos() {
    try {
        if (typeof window === 'undefined') {
            return null;
        }
        
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (!storedId) {
            throw new Error("ProprietarioId not found in localStorage");
        }
        const response = await api.get(`${urlSelect}/proprietarios/${storedId}/tipos`);
        return response.data;
    } catch (error) {
        console.error("Error fetching types:", error);
        return null;
    }
}

export async function getLinguagens() {
    try {
        if (typeof window === 'undefined') {
            return null;
        }
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (!storedId) {
            throw new Error("ProprietarioId not found in localStorage");
        }
        const response = await api.get(`${urlSelect}/proprietarios/${storedId}/linguagens`);
        return response.data;
    } catch (error) {
        console.error("Error fetching languages:", error);
        return null;
    }
}





export async function getDesenvolvedores() {
    try {
        if (typeof window === 'undefined') {
            return null;
        }
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (!storedId) {
            throw new Error("ProprietarioId not found in localStorage");
        }
        const response = await api.get(`${urlSelect}/proprietarios/${storedId}/desenvolvedores`);
        return response.data;
    } catch (error) {
        console.error("Error fetching developers:", error);
        return null;
    }
}

export async function getCategorias() {
    try {
        if (typeof window === 'undefined') {
            return null;
        }
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (!storedId) {
            throw new Error("ProprietarioId not found in localStorage");
        }
        const response = await api.get(`${urlSelect}/proprietarios/${storedId}/categorias`);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return null;
    }
}

export async function getStatus() {
    try {
        if (typeof window === 'undefined') {
            return null;
        }
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (!storedId) {
            throw new Error("ProprietarioId not found in localStorage");
        }
        const response = await api.get(`${urlSelect}/proprietarios/${storedId}/status`);
        return response.data;
    } catch (error) {
        console.error("Error fetching status:", error);
        return null;
    }
}

export async function getResponsaveis() {
    try {
        if (typeof window === 'undefined') {
            return null;
        }
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (!storedId) {
            throw new Error("ProprietarioId not found in localStorage");
        }
        const response = await api.get(`${urlSelect}/proprietarios/${storedId}/responsaveis`);
        return response.data;
    } catch (error) {
        console.error("Error fetching responsibles:", error);
        return null;
    }
}

export async function getHistoricoSolucoes() {
    try {
        const response = await api.get(`${urlSelect}/historico_solucoes`);
        return response.data;
    } catch (error) {
        console.error("Error fetching solution history:", error);
        return null;
    }
}


//times
export async function getTimes() {
    try {
        if (typeof window === 'undefined') {
            return null;
        }
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (!storedId) {
            throw new Error("ProprietarioId not found in localStorage");
        }
        const response = await api.get(`${urlSelect}/proprietarios/${storedId}/times`);
        return response.data;
    } catch (error) {
        console.error("Error fetching times:", error);
        return null;
    }
}

export async function createTime(time: any) {
    try {
        const response = await api.post(`${urlSelect}/times`, time);
        return response.data;
    } catch (error) {
        console.error("Error creating time:", error);
        return null;
    }
}

export async function updateTime(id: string, time: any) {
    try {
        const response = await api.put(`${urlSelect}/times/${id}`, time);
        return response.data;
    } catch (error) {
        console.error("Error updating time:", error);
        return null;
    }
}

export async function deleteTime(id: string) {
    try {
        const response = await api.delete(`${urlSelect}/times/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting time:", error);
        return null;
    }
}

export async function updateSolucoesSemProprietario() {
    try {
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (!storedId) {
            throw new Error("ProprietarioId not found in localStorage");
        }
        
        const response = await api.post(`${url}/update-sem-proprietario`, {
            proprietario_id: storedId
        });
        
        return response.data;
    } catch (error) {
        console.error("Error updating solutions without owner:", error);
        return null;
    }
}