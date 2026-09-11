import api from './api';

export const commentService = {
  getForTask: (taskId) => api.get(`/tasks/${taskId}/comments`).then((r) => r.data),
  create: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }).then((r) => r.data),
  update: (id, content) => api.put(`/comments/${id}`, { content }).then((r) => r.data),
  remove: (id) => api.delete(`/comments/${id}`).then((r) => r.data)
};
