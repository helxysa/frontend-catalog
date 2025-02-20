import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}`;

export async function getTipos() {
  const response = await axios.get(`${url}/tipos`);
  return response.data;
}

export async function getDemandas() {
  const response = await axios.get(`${url}/demandas`);
  return response.data;
}

export async function getSolucoes() {
  const response = await axios.get(`${url}/solucoes`);
  return response.data;
}

export async function getAlinhamentos() {
  const response = await axios.get(`${url}/alinhamentos`);
  return response.data;
}

export async function getStatus() {
  const response = await axios.get(`${url}/status`);
  return response.data;
}

export async function getCategorias() {
  const response = await axios.get(`${url}/categorias`);
  return response.data;
}

