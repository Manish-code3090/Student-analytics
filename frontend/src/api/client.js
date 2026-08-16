import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Attaches the active session token (set after center-chooser selection)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
