import api from '../../../../../../../../lib/api';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/times`;


export async function getTimes(proprietarioId: string) {
  const response = await api.get(`${baseUrl}/proprietarios/${proprietarioId}/times`);
  return response.data;
}

export async function getTimesById(id: string) {
  const response = await api.get(`${url}/${id}`);
  return response.data;
}

export async function createTimes(time: any) {
  const response = await api.post(`${url}`, time);
  return response.data;
}

export async function updateTimes(id: string, time: any) {
  const response = await api.put(`${url}/${id}`, time);
  return response.data;
}

export async function deleteTimes(id: string) {
  const response = await api.delete(`${url}/${id}`);
  return response.data;
}

