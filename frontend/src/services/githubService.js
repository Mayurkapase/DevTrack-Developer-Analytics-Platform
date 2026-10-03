import api from './api';

export const githubService = {
  fetchStats: async (username) => {
    const response = await api.post('/github/fetch', { username });
    return response.data.data;
  },

  forceRefresh: async (username) => {
    const response = await api.post('/github/refresh', { username });
    return response.data.data;
  },

  getMyStats: async () => {
    const response = await api.get('/github/me');
    return response.data.data;
  },

  getStatsByUserId: async (userId) => {
    const response = await api.get(`/github/user/${userId}`);
    return response.data.data;
  },
};
