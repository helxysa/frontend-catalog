import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in the environment variables.");
}
const url = `${baseUrl}/status`;

export async function getStatus() {
  const response = await axios.get(url);
  return response.data;
}

export async function getStatusById(id: string) {
  const response = await axios.get(`${url}/${id}`);
  return response.data;
}

export async function createStatus(status: any) {
  const response = await axios.post(`${url}`, status);
  return response.data;
}

export async function updateStatus(id: string, status: any) {
  const response = await axios.put(`${url}/${id}`, status);
  return response.data;
}

export async function deleteStatus(id: string) {
  const response = await axios.delete(`${url}/${id}`);
  return response.data;
}

