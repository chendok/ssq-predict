import client from './client';

export const traditionalApi = {
  predict: (method: string | string[], ganzhi: string, count: number = 1) =>
    client.post('/predict/traditional/', { method, ganzhi, count }),
  getYearlySha: (date?: string) =>
    client.get('/divination/gods-and-sha/yearly', { params: { date } }),
  getNobleStars: (date?: string) =>
    client.get('/divination/gods-and-sha/noble', { params: { date } }),
};
