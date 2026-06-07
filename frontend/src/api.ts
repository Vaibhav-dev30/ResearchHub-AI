import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (!config.headers) config.headers = {} as typeof config.headers;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
