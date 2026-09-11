import { useEffect } from 'react';
import { getSocket } from '../services/socket';

export function useProjectSocket(projectId, handlers) {
  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    socket.emit('joinProject', projectId);

    if (handlers.onTaskCreated) socket.on('task:created', handlers.onTaskCreated);
    if (handlers.onTaskUpdated) socket.on('task:updated', handlers.onTaskUpdated);
    if (handlers.onTaskDeleted) socket.on('task:deleted', handlers.onTaskDeleted);
    if (handlers.onProjectUpdated) socket.on('project:updated', handlers.onProjectUpdated);

    return () => {
      socket.emit('leaveProject', projectId);
      if (handlers.onTaskCreated) socket.off('task:created', handlers.onTaskCreated);
      if (handlers.onTaskUpdated) socket.off('task:updated', handlers.onTaskUpdated);
      if (handlers.onTaskDeleted) socket.off('task:deleted', handlers.onTaskDeleted);
      if (handlers.onProjectUpdated) socket.off('project:updated', handlers.onProjectUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);
}
