import api from '../../lib/api';
import axios, { AxiosError } from 'axios';
import { RegisterUserData, CreateProprietarioData } from '../types/type';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';

function VerifyRole(role: number){
  if (role === 2) {
    return 'admin'
  } 
  else {
    return 'user'
  }
}

// Função para obter proprietários com base no tipo de usuário
export async function getProprietarios() {
  try {
    // Obter informações do usuário atual
    const userResponse = await api.get(`${baseUrl}/auth/me`);
    const user = userResponse.data.user;
    console.log(user.roleId)

    // Se for admin (roleId 2), buscar todos os proprietários
    if (VerifyRole(user.roleId) === 'admin') {
      const response = await api.get(`${baseUrl}/proprietarios`);
      return response.data;
    } 
    // Se não for admin, buscar apenas os proprietários do usuário
    else {
      const response = await api.get(`${baseUrl}/users/${user.id}/proprietarios`);
      return response.data;
    }
  } catch (error) {
    console.error('Erro ao buscar proprietários:', error);
    return { error: true, message: 'Falha ao carregar proprietários' };
  }
}

// Função para obter um proprietário específico
// Também verifica se o usuário tem permissão para acessar este proprietário
export async function getProprietarioById(id: string) {
  try {
    // Obter informações do usuário atual
    const userResponse = await api.get(`${baseUrl}/auth/me`);
    const user = userResponse.data.user;
    
    // Se for admin, pode acessar qualquer proprietário
    if (user.id === 1) {
      const response = await api.get(`${baseUrl}/proprietarios/${id}`);
      return response.data;
    } 
    // Se não for admin, verificar se o proprietário pertence ao usuário
    else {
      const response = await api.get(`${baseUrl}/proprietarios/${id}`);
      const proprietario = response.data;
      
      if (proprietario.user_id === user.id) {
        return proprietario;
      } else {
        throw new Error('Acesso não autorizado a este proprietário');
      }
    }
  } catch (error) {
    console.error('Erro ao buscar proprietário:', error);
    throw error;
  }
}

export async function createProprietario(proprietario: CreateProprietarioData) {
  try {
    // Get current user info first
    const userResponse = await api.get(`${baseUrl}/auth/me`);
    const userId = userResponse.data.user.id;

    if (!proprietario.nome || !proprietario.sigla) {
      throw new Error('Nome e sigla são campos obrigatórios');
    }

    const formData = new FormData();
    formData.append('nome', proprietario.nome.trim());
    formData.append('sigla', proprietario.sigla.trim());
    formData.append('user_id', userId.toString());

    if (proprietario.descricao) {
      formData.append('descricao', proprietario.descricao.trim());
    }

    if (proprietario.logo) {
      formData.append('logo', proprietario.logo);
    }

    // Fix the URL - it should include the endpoint path
    const response = await api.post(`${baseUrl}/proprietarios`, formData, {
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

export async function updateProprietario(id: string, proprietario: Partial<CreateProprietarioData & { user_id: string | number | null }>) {
  try {
    console.log('Updating proprietario with ID:', id); // Debug log

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
    
    // Adicionar user_id ao formData
    if (proprietario.user_id !== undefined) {
      formData.append('user_id', proprietario.user_id ? proprietario.user_id.toString() : '');
    }

    const response = await api.put(`${baseUrl}/proprietarios/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating proprietario:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 404) {
        throw new Error('Proprietário não encontrado');
      }
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Dados inválidos. Verifique os campos e tente novamente.';
        throw new Error(errorMessage);
      }
    }
    throw new Error('Erro ao atualizar proprietário');
  }
}

export async function deleteProprietario(id: string, _credentials: { email: string; password: string; }) {
  try {
    // Não precisamos mais enviar as credenciais aqui, pois já foram verificadas pelo contexto de autenticação
    const response = await api.delete(`${baseUrl}/proprietarios/${id}`);
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
    const response = await api.post(`${baseUrl}/proprietarios/${id}/clone`);
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

// Função para registrar um novo usuário (apenas para admin)
export async function registerUser(userData: RegisterUserData) {
  try {
    // Verificar se os campos obrigatórios estão preenchidos
    if (!userData.fullName || !userData.email || !userData.password) {
      throw new Error('Nome completo, email e senha são campos obrigatórios');
    }

    // Fazer a requisição para registrar o usuário
    const response = await api.post(`${baseUrl}/auth/register`, userData, {
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error registering user:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 401) {
        throw new Error('Você precisa estar autenticado para registrar um usuário.');
      }

      if (error.response?.status === 403) {
        throw new Error('Apenas administradores podem registrar novos usuários.');
      }

      if (error.response?.status === 409) {
        throw new Error('Este email já está em uso.');
      }

      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Dados inválidos. Verifique os campos e tente novamente.';
        throw new Error(errorMessage);
      }
    }

    // Rejeitar a promessa para que o erro seja capturado no componente
    throw error instanceof Error ? error : new Error('Não foi possível registrar o usuário. Por favor, tente novamente.');
  }
}
