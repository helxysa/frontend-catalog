import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}`;

export async function getTipos() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${url}/proprietarios/${storedId}/tipos`);
  return response.data;
}

export async function getDemandas() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
    throw new Error("ProprietarioId not found in localStorage");
  }
  try {
    // Usa a nova rota específica para o dashboard
    const response = await axios.get(`${url}/proprietarios/${storedId}/dashboard/demandas`);
    const demandas = response.data;

    // Get alinhamentos
    const alinhamentosResponse = await axios.get(`${url}/proprietarios/${storedId}/alinhamentos`);
    const alinhamentos = alinhamentosResponse.data;

    // Merge alinhamentos into demandas
    const demandasWithAlinhamentos = demandas.map((demanda: any) => ({
      ...demanda,
      alinhamento: alinhamentos.find((a: any) => a.id === demanda.alinhamentoId)
    }));

    return demandasWithAlinhamentos;
  } catch (error) {
    console.error('Error fetching demandas:', error);
    throw error;
  }
}

export async function getSolucoes() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
    throw new Error("ProprietarioId not found in localStorage");
  }

  try {
    // Get soluções
    const response = await axios.get(`${url}/proprietarios/${storedId}/dashboard/todas-solucoes`);

    // Get alinhamentos
    const alinhamentosResponse = await axios.get(`${url}/proprietarios/${storedId}/alinhamentos`);

    // Get demandas
    const demandasResponse = await axios.get(`${url}/proprietarios/${storedId}/dashboard/demandas`);

    // Get responsáveis
    const responsaveisResponse = await axios.get(`${url}/proprietarios/${storedId}/responsaveis`);

    // Merge relationships
    const solucoes = response.data.data || [];
    const alinhamentos = alinhamentosResponse.data || [];
    const demandas = demandasResponse.data || [];
    const responsaveis = responsaveisResponse.data || [];

    // First merge alinhamentos into demandas
    const demandasWithAlinhamentos = demandas.map((demanda: any) => ({
      ...demanda,
      alinhamento: alinhamentos.find((a: any) => a.id === demanda.alinhamentoId)
    }));

    // Then merge demandas with alinhamentos into solucoes and add responsaveis
    const solucoesWithRelationships = solucoes.map((solucao: any) => {
      // Verificar se já temos o objeto responsavel precarregado
      let responsavelObj = solucao.responsavel;

      // Verificar todos os possíveis nomes de campo para o ID do responsável
      // No backend é responsavel_id, no frontend é responsavelId
      const responsavelId = solucao.responsavel_id || solucao.responsavelId;

      // Log para depuração dos campos disponíveis
      if (solucao.id === 34 || solucao.id === 44 || solucao.id === 27) {
        console.log(`Campos da solução ${solucao.id}:`, Object.keys(solucao));
        console.log(`Valores importantes: responsavel_id=${solucao.responsavel_id}, responsavelId=${solucao.responsavelId}, responsavel=`, solucao.responsavel);
      }

      // Se não tiver o objeto responsavel precarregado, mas tiver o ID, buscar na lista de responsáveis
      if (!responsavelObj && responsavelId) {
        // Converter para número para garantir a comparação correta
        const respId = Number(responsavelId);
        responsavelObj = responsaveis.find((r: any) => r.id === respId || r.id === responsavelId) || null;

        // Se não encontrou, tentar buscar por string
        if (!responsavelObj) {
          const respIdStr = String(responsavelId);
          responsavelObj = responsaveis.find((r: any) => String(r.id) === respIdStr) || null;
        }
      }

      // Log para depuração
      console.log(`Solução ${solucao.id} - responsavelId: ${responsavelId}, responsavel:`,
        responsavelObj ? `${responsavelObj.id} - ${responsavelObj.nome}` : 'não encontrado');

      // Verificar se temos o objeto responsável, mas não temos o nome
      if (responsavelObj && !responsavelObj.nome && responsavelId) {
        // Tentar buscar novamente pelo ID
        const respById = responsaveis.find((r: any) => r.id === responsavelId);
        if (respById) {
          console.log(`Encontrado responsável pelo ID ${responsavelId}:`, respById.nome);
          responsavelObj = respById;
        }
      }

      return {
        ...solucao,
        demanda: demandasWithAlinhamentos.find((d: any) => d.id === solucao.demanda_id),
        responsavel: responsavelObj,
        responsavelId: responsavelId
      };
    });

    return solucoesWithRelationships;
  } catch (error) {
    console.error('Erro ao buscar soluções:', error);
    throw error;
  }
}

export async function getAlinhamentos() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  try {
    const response = await axios.get(`${url}/proprietarios/${storedId}/alinhamentos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alinhamentos:', error);
    throw error;
  }
}

export async function getStatus() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${url}/proprietarios/${storedId}/status`);
  return response.data;
}

export async function getCategorias() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${url}/proprietarios/${storedId}/categorias`);
  return response.data;
}

export async function getDesenvolvedores(){
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  const response = await axios.get(`${url}/proprietarios/${storedId}/desenvolvedores`);
  return response.data;
}

export async function getPrioridades() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  try {
    const response = await axios.get(`${url}/proprietarios/${storedId}/prioridades`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prioridades:', error);
    throw error;
  }
}

export async function getResponsaveis() {
  const storedId = localStorage.getItem('selectedProprietarioId');
  if (!storedId) {
      throw new Error("ProprietarioId not found in localStorage");
  }
  try {
    console.log(`Buscando responsáveis para proprietário ID: ${storedId}`);
    const response = await axios.get(`${url}/proprietarios/${storedId}/responsaveis`);
    console.log('Resposta da API de responsáveis:', response.data);

    // Garantir que os dados estão no formato esperado
    const responsaveis = Array.isArray(response.data) ? response.data : [];

    // Verificar se cada responsável tem um nome
    responsaveis.forEach((resp, index) => {
      if (!resp.nome) {
        console.warn(`Responsável ${index} (ID: ${resp.id}) não tem nome:`, resp);
      }
    });

    return responsaveis;
  } catch (error) {
    console.error('Error fetching responsaveis:', error);
    throw error;
  }
}