import axios from 'axios';

// In development, REACT_APP_API_URL is not set, so it falls back to '' (empty string)
// which means requests go to the same origin (works with the proxy in package.json).
// In production (Vercel), REACT_APP_API_URL is set to your Render backend URL.
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

// Automatically attach the JWT token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
