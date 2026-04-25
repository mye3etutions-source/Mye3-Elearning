import axios from 'axios';

// Set baseURL to the root of the server
const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const instance = axios.create({
  baseURL: base.endsWith('/') ? `${base}api` : `${base}/api`,
  withCredentials: true,
});

// Add a request interceptor to include the Bearer token
instance.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      // Only redirect to login if not already there AND not on public pages like courses/catalog
      const publicPaths = ['/login', '/register', '/', '/courses', '/about', '/contact-us'];
      const isPublicPath = publicPaths.some(path => window.location.pathname === path);
      
      if (!isPublicPath) {
         localStorage.removeItem('userInfo');
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
