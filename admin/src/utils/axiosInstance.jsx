import axios from 'axios';

import { getDeviceId } from './deviceId';

let logoutHandler = null;

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const { hostname, protocol } = window.location;

// isDev = Vite dev server is running (works for localhost AND LAN IPs like 172.x.x.x)
const isDev = import.meta.env.DEV;

const axiosInstance = axios.create({
  baseURL: isDev
    ? (import.meta.env.VITE_API_BASE_URL || `${protocol}//${hostname}:4000/api`)
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Device fingerprint for multi-account detection (Risk & Fraud).
  const deviceId = getDeviceId();
  if (deviceId) {
    config.headers['X-Device-Id'] = deviceId;
  }
  return config;
});



axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && logoutHandler) {
      logoutHandler();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
