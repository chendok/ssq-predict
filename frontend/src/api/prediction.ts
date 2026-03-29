import client from './client';

export const predictionApi = {
  predict: (algorithms: string[]) => client.post('/predict/', { algorithms }),
  getHistory: (params?: Record<string, unknown>) => client.get('/history/', { params }),
  interpret: (type: 'prediction' | 'traditional', data: Record<string, unknown>) => client.post('/interpret/', { type, data }),
  updateData: () => client.post('/update-data/'),
};
