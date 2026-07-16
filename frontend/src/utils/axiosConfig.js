import axios from "axios";

const { hostname, protocol } = window.location;

// isDev = Vite dev server is running (works for localhost AND LAN IPs like 172.x.x.x)
const isDev = import.meta.env.DEV;

const api = axios.create({
  baseURL: isDev
    ? (import.meta.env.VITE_API_BASE_URL || `${protocol}//${hostname}:4000/api`)
    : "/api",
  withCredentials: true,
});

//  Request Interceptor → Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  Response Interceptor → Auto logout if unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if user is trying to access protected routes
      const currentPath = window.location.pathname;
      const protectedRoutes = ['/mybets', '/user/'];
      
      // Check if current path is a protected route
      const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
      
      // if (isProtectedRoute) {
      //   localStorage.removeItem("token");
      //   localStorage.removeItem("user");
      //   window.location.href = "/login";
      // }
      localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export const host = isDev
  ? `${protocol === 'https:' ? 'wss:' : 'ws:'}//${hostname}:4000`
  : `${protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;


