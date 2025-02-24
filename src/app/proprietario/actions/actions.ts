import axios from 'axios';

export const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
const url = `${baseURL}/proprietarios`;

// Define interface for proprietario data
interface CreateProprietarioData {
  nome: string;
  sigla: string;
  descricao?: string;
  logo?: File;
}

export async function getProprietario() {
  try {
    console.log('Fetching from URL:', url); // Debug log
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle database not found error
      if (error.response?.status === 500) {
        if (error.response?.data?.message?.includes('não existe')) {
          // Database table doesn't exist
          return []; // Return empty array to show "create first" screen
        }
      }
      
      // Log detailed error information
      console.error('Axios Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    // Throw a generic error that will be caught by the component
    throw new Error('Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.');
  }
}

export async function getProprietarioById(id: string) {
  try {
    const response = await axios.get(`${url}/${id}`);
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
    // Validate required fields
    if (!proprietario.nome || !proprietario.sigla) {
      throw new Error('Nome e sigla são campos obrigatórios');
    }

    // Create FormData instance
    const formData = new FormData();
    formData.append('nome', proprietario.nome.trim());
    formData.append('sigla', proprietario.sigla.trim());
    
    if (proprietario.descricao) {
      formData.append('descricao', proprietario.descricao.trim());
    }
    
    if (proprietario.logo) {
      formData.append('logo', proprietario.logo);
    }

    console.log('Creating proprietario with data:', Object.fromEntries(formData)); // Debug log

    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creating proprietario:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // Handle specific error cases
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
    const response = await axios.put(`${url}/${id}`, proprietario);
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

export async function deleteProprietario(id: string) {
  try {
    const response = await axios.delete(`${url}/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting proprietario:', error.response?.data);
      if (error.response?.status === 404) {
        throw new Error('Proprietário não encontrado');
      }
    }
    throw new Error('Erro ao excluir proprietário');
  }
}
