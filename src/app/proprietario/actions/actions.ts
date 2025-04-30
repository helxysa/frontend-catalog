import api from '../../lib/api';
import axios, { AxiosError } from 'axios';

export const baseURL = process.env.NEXT_PUBLIC_BASE_URL
const url = '/proprietarios';

// Define interface for proprietario data
interface CreateProprietarioData {
  nome: string;
  sigla: string;
  descricao?: string;
  logo?: File;
}

export async function getProprietario() {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return {
          error: true,
          message: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
        };
      }

      if (error.response.status === 500 && error.response.data?.message?.includes('não existe')) {
        return [];
      }

      if (error.response.status >= 500) {
        return {
          error: true,
          message: 'Erro interno do servidor. Por favor, tente novamente mais tarde.'
        };
      }


      if (error.response.data?.message) {
        return {
          error: true,
          message: error.response.data.message
        };
      }
    }


    return {
      error: true,
      message: 'Ocorreu um erro inesperado. Por favor, tente novamente.'
    };
  }
}

export async function getProprietarioById(id: string) {
  try {
    const response = await api.get(`${url}/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching proprietario by ID:', error.response?.data);
      if (error.response?.status === 404) {
        throw new Error('Proprietário não encontrado');
      }
    }
    throw new Error('Erro ao buscar dados do proprietário');
  }
}

export async function createProprietario(proprietario: CreateProprietarioData) {
  try {

    if (!proprietario.nome || !proprietario.sigla) {
      throw new Error('Nome e sigla são campos obrigatórios');
    }

    const formData = new FormData();
    formData.append('nome', proprietario.nome.trim());
    formData.append('sigla', proprietario.sigla.trim());

    if (proprietario.descricao) {
      formData.append('descricao', proprietario.descricao.trim());
    }

    if (proprietario.logo) {
      formData.append('logo', proprietario.logo);
    }


    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creating proprietario:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Dados inválidos. Verifique os campos e tente novamente.';
        throw new Error(errorMessage);
      }

      if (error.response?.status === 409) {
        throw new Error('Já existe um proprietário com este nome ou sigla.');
      }
    }

    throw new Error('Não foi possível criar o proprietário. Por favor, tente novamente.');
  }
}

export async function updateProprietario(id: string, proprietario: Partial<CreateProprietarioData>) {
  try {

    const formData = new FormData();

    if (proprietario.nome) {
      formData.append('nome', proprietario.nome.trim());
    }
    if (proprietario.sigla) {
      formData.append('sigla', proprietario.sigla.trim());
    }
    if (proprietario.descricao !== undefined) {
      formData.append('descricao', proprietario.descricao.trim());
    }
    if (proprietario.logo) {
      formData.append('logo', proprietario.logo);
    }

    const response = await api.put(`${url}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating proprietario:', error.response?.data);
      if (error.response?.status === 404) {
        throw new Error('Proprietário não encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error('Dados inválidos. Verifique os campos e tente novamente.');
      }
    }
    throw new Error('Erro ao atualizar proprietário');
  }
}

export async function deleteProprietario(id: string, _credentials: { email: string; password: string; }) {
  try {
    // Não precisamos mais enviar as credenciais aqui, pois já foram verificadas pelo contexto de autenticação
    const response = await api.delete(`${url}/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting proprietario:', error.response?.data);
      if (error.response?.status === 404) {
        throw new Error('Proprietário não encontrado');
      }
      if (error.response?.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para excluir esta unidade.');
      }
    }
    throw new Error('Erro ao excluir proprietário');
  }
}

export async function cloneProprietario(id: string) {
  try {
    const response = await api.post(`${url}/${id}/clone`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error cloning proprietario:', error.response?.data);
      if (error.response?.status === 404) {
        throw new Error('Proprietário não encontrado');
      }
    }
    throw new Error('Erro ao clonar proprietário');
  }
}
