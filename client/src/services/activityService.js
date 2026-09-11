import api from './api';

export const activityService = {
  getForProject: (projectId) => api.get(`/projects/${projectId}/activity`).then((r) => r.data)
};
