import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://bookmaster.fun/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  validateStatus: (status) => {
    // Consider all status codes valid to handle them in the response
    return true;
  },
  transformResponse: [(data) => {
    try {
      // Try to parse the response as JSON
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Log the parsed response for debugging
      console.debug('API Response:', {
        parsed,
        raw: data
      });

      return {
        parsed,
        raw: data
      };
    } catch (e) {
      console.error('Failed to parse API response:', e);
      console.debug('Raw response:', data);
      
      return {
        parsed: null,
        raw: data
      };
    }
  }]
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request for debugging
    console.debug('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    // If we get HTML when expecting JSON, treat it as an error
    if (
      response.headers['content-type']?.includes('text/html') &&
      !response.config.headers?.Accept?.includes('text/html')
    ) {
      console.error('Received HTML response when expecting JSON:', response.data.raw);
      toast.error('Server Error: Received HTML instead of JSON');
      
      return Promise.reject({
        response: {
          status: 500,
          data: {
            message: 'Received HTML response when expecting JSON',
            raw: response.data.raw
          }
        }
      });
    }

    // Check if the response has the expected format
    const data = response.data.parsed;
    if (!data?.success && response.status !== 200) {
      console.error('API Error Response:', {
        status: response.status,
        data: response.data
      });
      
      const errorMessage = data?.message || data?.error?.message || 'An error occurred';
      toast.error(errorMessage);
      
      return Promise.reject({
        response: {
          status: response.status,
          data: {
            message: errorMessage,
            raw: response.data.raw
          }
        }
      });
    }

    return response;
  },
  (error) => {
    console.error('API Response Error:', error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      toast.error('Session expired. Please login again.');
    } else {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;