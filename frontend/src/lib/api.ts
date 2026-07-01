import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const queryPapers = async (question: string) => {
  const response = await api.post("/query/", { question });
  return response.data;
};

export const getQueryHistory = async () => {
  const response = await api.get("/query/history");
  return response.data;
};

export const getPaperGraph = async (paperId: string) => {
  const response = await api.get(`/papers/${paperId}/graph`);
  return response.data;
};

export default api;