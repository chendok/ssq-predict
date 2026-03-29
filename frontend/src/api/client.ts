import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
});

// Retry configuration
interface RetryConfig {
  retries: number;
  retryDelay: (retryCount: number) => number;
  retryCondition: (error: AxiosError) => boolean;
}

const retryConfig: RetryConfig = {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // 1s, 2s, 3s
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    // Don't retry on 4xx errors (client errors)
    // axios.isAxiosError(error) check is implicit via type guard in parameter
    return (
      (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') ||
      (error.response?.status ? error.response.status >= 500 : false)
    );
  }
};

// Add retry capability to config
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retryCount?: number;
  }
}

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig;

    // If config does not exist or the retry option is not set, reject
    if (!config) {
      return Promise.reject(error);
    }

    // Set default retry count
    config._retryCount = config._retryCount || 0;

    // Check if we should retry
    if (
      config._retryCount < retryConfig.retries &&
      retryConfig.retryCondition(error)
    ) {
      config._retryCount += 1;

      // Exponential backoff or linear delay
      const delay = retryConfig.retryDelay(config._retryCount);

      // Wait for the delay
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry the request
      return client(config);
    }

    // Handle global errors here
    console.error('API Error:', error);

    // If the request is unauthorized, clear the token and user data
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete client.defaults.headers.common['Authorization'];

      window.dispatchEvent(new Event('auth:logout'));
    }

    return Promise.reject(error);
  }
);

export default client;
