import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/dashboard/StatCard';
import BreakdownBars from '../components/dashboard/BreakdownBars';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    dashboardService
      .get()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const { stats, tasksByStatus, tasksByPriority, upcomingDeadlines, recentActivity } = data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-ink-soft">Here's where things stand across your projects.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total" value={stats.totalProjects} accent="brand" />
        <StatCard label="Active" value={stats.activeProjects} accent="brand" />
        <StatCard label="Completed" value={stats.completedProjects} accent="success" />
        <StatCard label="Assigned" value={stats.assignedTasksCount} accent="amber" />
        <StatCard label="Pending" value={stats.pendingTasks} accent="danger" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownBars title="Tasks by status" data={tasksByStatus} labelMap="status" />
        <BreakdownBars title="Tasks by priority" data={tasksByPriority} labelMap="priority" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UpcomingDeadlines tasks={upcomingDeadlines} />
        <RecentActivity tasks={recentActivity} />
      </div>
    </div>
  );
}
