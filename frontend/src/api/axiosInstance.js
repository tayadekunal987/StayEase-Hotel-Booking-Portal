import axios from 'axios';

/**
 * Pre-configured Axios instance used for all API calls.
 * The base URL is read from the VITE_API_BASE_URL environment variable
 * defined in the .env file.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;

