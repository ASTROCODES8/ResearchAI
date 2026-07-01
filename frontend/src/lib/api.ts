import axios from "axios";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
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