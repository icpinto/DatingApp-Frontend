import httpClient from '../services/api';

export const http = {
  get: async <T>(url: string, config?: Record<string, unknown>): Promise<T> => {
    const response = await httpClient.get(url, config);
    return response.data as T;
  },
  post: async <T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> => {
    const response = await httpClient.post(url, data, config);
    return response.data as T;
  },
  patch: async <T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> => {
    const response = await httpClient.patch(url, data, config);
    return response.data as T;
  },
  delete: async <T>(url: string, config?: Record<string, unknown>): Promise<T> => {
    const response = await httpClient.delete(url, config);
    return response.data as T;
  },
};

export default http;
