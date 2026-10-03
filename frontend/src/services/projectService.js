import api from './api';

export const projectService = {
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data.data;
  },

  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  getSummary: async () => {
    const response = await api.get('/projects/summary');
    return response.data.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data.data;
  },

  createTask: async (projectId, taskData) => {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData);
    return response.data.data;
  },

  updateTask: async (projectId, taskId, taskData) => {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
    return response.data.data;
  },

  deleteTask: async (projectId, taskId) => {
    const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    return response.data.data;
  },
};
