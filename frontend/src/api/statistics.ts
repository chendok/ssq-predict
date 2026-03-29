import client from './client';

export const statisticsApi = {
  getStatistics: () => client.get('/statistics/'),
};
