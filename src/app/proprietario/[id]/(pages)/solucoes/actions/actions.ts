import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/solucoes`;

export async function getSolucoes() {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching solutions:", error);
        return null;
    }
}

export async function getSolucaoById(id: string) {
    try {
        const response = await axios.get(`${url}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching solution by ID:", error);
        return null;
    }
}

export async function createSolucao(solucao: any) {
    try {
        const response = await axios.post(`${url}`, solucao);
        return response.data;
    } catch (error) {
        console.error("Error creating solution:", error);
        return null;
    }
}

export async function updateSolucao(id: string, solucao: any) {
    try {
        const response = await axios.put(`${url}/${id}`, solucao);
        return response.data;
    } catch (error) {
        console.error("Error updating solution:", error);
        return null;
    }
}

export async function deleteSolucao(id: string) {
    try {
        const response = await axios.delete(`${url}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting solution:", error);
        return null;
    }
}


//select aqui
const urlSelect = `${baseUrl}`;

export async function getDemandas() {
    try {
        const response = await axios.get(`${urlSelect}/demandas`);
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
        const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/tipos`);
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
        const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/linguagens`);
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
        const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/desenvolvedores`);
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
        const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/categorias`);
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
        const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/status`);
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
        const response = await axios.get(`${urlSelect}/proprietarios/${storedId}/responsaveis`);
        return response.data;
    } catch (error) {
        console.error("Error fetching responsibles:", error);
        return null;
    }
}

export async function getHistoricoSolucoes() {
    try {
        const response = await axios.get(`${urlSelect}/historico_solucoes`);
        return response.data;
    } catch (error) {
        console.error("Error fetching solution history:", error);
        return null;
    }
}
