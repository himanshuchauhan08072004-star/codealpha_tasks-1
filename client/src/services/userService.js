import api from './api';

export const userService = {
  search: (search) => api.get('/users', { params: { search } }).then((r) => r.data)
};
