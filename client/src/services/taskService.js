import api from './api';

export const taskService = {
  getForProject: (projectId, params) =>
    api.get(`/projects/${projectId}/tasks`, { params }).then((r) => r.data),
  getOne: (id) => api.get(`/tasks/${id}`).then((r) => r.data),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data).then((r) => r.data),
  update: (id, data) => api.put(`/tasks/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/tasks/${id}`).then((r) => r.data)
};
