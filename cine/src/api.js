import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Ruta al backend
});

export default api;