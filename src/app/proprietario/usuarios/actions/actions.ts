import api from '../../../lib/api';
import axios from 'axios';
import { UserRegister } from '../types/type';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
export async function listUsers() {
  try {
    const response = await api.get(`${baseUrl}/auth/list-users`);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
}

export async function registerUser(userData: {
  fullName: string;
  email: string;
  password: string;
  roleId: number;
}) {
  try {
    if (!userData.fullName || !userData.email || !userData.password) {
      throw new Error('Nome completo, email e senha são campos obrigatórios');
    }

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

    throw error instanceof Error ? error : new Error('Não foi possível registrar o usuário. Por favor, tente novamente.');
  }
}

export async function updateUser(userData: {
  id: number;
  fullName: string;
  email: string;
  password?: string;
  roleId: number;
}) {
  try {
    if (!userData.id) {
      throw new Error('ID do usuário é necessário para edição');
    }

    const response = await api.put(`${baseUrl}/auth/update-user`, userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating user:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 401) {
        throw new Error('Você precisa estar autenticado para atualizar um usuário.');
      }

      if (error.response?.status === 403) {
        throw new Error('Apenas administradores podem atualizar usuários.');
      }

      if (error.response?.status === 409) {
        throw new Error('Este email já está em uso por outro usuário.');
      }

      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Dados inválidos. Verifique os campos e tente novamente.';
        throw new Error(errorMessage);
      }
    }

    throw error instanceof Error ? error : new Error('Não foi possível atualizar o usuário. Por favor, tente novamente.');
  }
}

// Função para excluir um usuário
export async function deleteUser(id: number) {
  try {
    const response = await api.delete(`${baseUrl}/auth/delete-user/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting user:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 401) {
        throw new Error('Você precisa estar autenticado para excluir um usuário.');
      }

      if (error.response?.status === 403) {
        throw new Error('Apenas administradores podem excluir usuários.');
      }

      if (error.response?.status === 404) {
        throw new Error('Usuário não encontrado.');
      }
    }

    throw error instanceof Error ? error : new Error('Não foi possível excluir o usuário. Por favor, tente novamente.');
  }
}

export async function checkIsAdmin() {
  try {
    const response = await api.get(`${baseUrl}/auth/me`);
    return response.data.user?.roleId === 2; 
  } catch (error) {
    console.error('Erro ao verificar permissões do usuário:', error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get(`${baseUrl}/auth/me`);
    return response.data.user;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    throw error;
  }
}