import api from '../../../../../../lib/api';


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
      throw error;
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
        const storedId = localStorage.getItem('selectedProprietarioId');
        if (!storedId) {
            throw new Error("ProprietarioId not found in localStorage");
        }
        // Usar um limit alto para pegar todas as demandas do proprietário
        const response = await api.get(`${urlSelect}/demandas/busca/${storedId}?limit=1000`);
        return response.data.data; // Note: resposta paginada tem .data
    } catch (error) {
        console.error("Error fetching all demands:", error);
        return null;
    }
}

export async function getDemandas(proprietariId: string) {
    try {
        const response = await api.get(`${urlSelect}/demandas`);
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

