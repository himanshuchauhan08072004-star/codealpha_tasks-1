import api from './api';

export const projectService = {
  getAll: (params) => api.get('/projects', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/projects/${id}`).then((r) => r.data),
  create: (data) => api.post('/projects', data).then((r) => r.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }).then((r) => r.data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`).then((r) => r.data)
};
