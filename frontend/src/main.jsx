import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store/store.js'
import App from './App.jsx'
import ErrorBoundary from './components/shared/ErrorBoundary.jsx'
import axios from 'axios'
import './index.css'

// Global Axios Configuration (Intelligent Local vs Production detection)
const getBaseUrl = () => {
    // If we are on localhost, force the local backend URL
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    // Otherwise use the env variable
    const envUrl = import.meta.env.VITE_API_URL || 'https://mye3etutions.com/api';
    return envUrl.includes('/api') ? envUrl : (envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`);
};

axios.defaults.baseURL = getBaseUrl();

axios.defaults.withCredentials = true;

// Add a request interceptor to include the Bearer token
axios.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        // Corrupt localStorage
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 Unauthorized (MATCHING YOUR SCREENSHOT)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
         localStorage.removeItem('userInfo');
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>,
)
