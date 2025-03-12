import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/times`;


export async function getTimes(proprietarioId: string) {
  const response = await axios.get(`${baseUrl}/proprietarios/${proprietarioId}/times`);
  return response.data;
}

export async function getTimesById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createTimes(time: any) {
  const response = await axios.post(`${url}`, time);
  return response.data;
}

export async function updateTimes(id: string, time: any) {
  const response = await axios.put(`${url}/${id}`, time);
  return response.data;
}

export async function deleteTimes(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}

