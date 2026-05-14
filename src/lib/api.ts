import axios from 'axios';

const AZURE_API_BASE_URL = import.meta.env.VITE_AZURE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: AZURE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for authentication if needed in the future
api.interceptors.request.use((config) => {
  // Add Azure AD tokens or API keys here
  return config;
});

export default api;
