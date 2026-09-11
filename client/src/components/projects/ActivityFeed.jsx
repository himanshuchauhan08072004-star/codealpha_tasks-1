import { useEffect, useState } from 'react';
import { activityService } from '../../services/activityService';
import { getSocket } from '../../services/socket';
import UserAvatar from '../common/UserAvatar';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

const DESCRIBE = {
  project_created: () => 'created the project',
  task_created: (a) => `created "${a.task?.title || a.meta?.title}"`,
  task_assigned: (a) => `assigned "${a.task?.title || a.meta?.title}"`,
  task_status_changed: (a) =>
    `moved "${a.task?.title || a.meta?.title}" to ${(a.meta?.to || '').replace('_', ' ')}`,
  task_priority_changed: (a) =>
    `set "${a.task?.title || a.meta?.title}" priority to ${a.meta?.to}`,
  task_deleted: (a) => `deleted "${a.meta?.title}"`,
  comment_added: (a) => `commented on "${a.task?.title || a.meta?.title}"`,
  member_added: (a) => `added ${a.meta?.memberName} to the project`
};

export default function ActivityFeed({ projectId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    activityService
      .getForProject(projectId)
      .then((res) => setActivities(res.activities))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    const socket = getSocket();
    const onCreated = (activity) => setActivities((prev) => [activity, ...prev]);
    socket.on('activity:created', onCreated);
    return () => socket.off('activity:created', onCreated);
  }, [projectId]);

  if (loading) return <LoadingSpinner size="lg" className="py-16" />;

  if (activities.length === 0) {
    return <EmptyState title="No activity yet" description="Actions on this project will show up here." />;
  }

  return (
    <div className="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface">
      {activities.map((a) => {
        const describe = DESCRIBE[a.type];
        return (
          <div key={a._id} className="flex items-center gap-3 px-4 py-3 text-sm">
            <UserAvatar user={a.actor} size="sm" />
            <p className="min-w-0 flex-1 truncate text-ink">
              <span className="font-medium">{a.actor?.name}</span>{' '}
              <span className="text-ink-soft">{describe ? describe(a) : a.type}</span>
            </p>
            <span className="shrink-0 text-xs text-ink-soft">
              {new Date(a.createdAt).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
