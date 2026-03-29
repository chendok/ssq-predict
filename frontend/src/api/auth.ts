import client from './client';

export const authApi = {
  login: (data: Record<string, unknown>) => client.post('/login/', data),
  register: (data: Record<string, unknown>) => client.post('/register/', data),
};
