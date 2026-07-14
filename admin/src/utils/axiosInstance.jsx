import axios from 'axios';

let logoutHandler = null;

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const axiosInstance = axios.create({
  baseURL: isLocal ? 'http://localhost:3000/api' : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
