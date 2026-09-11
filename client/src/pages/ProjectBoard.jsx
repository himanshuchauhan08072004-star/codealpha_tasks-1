import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useProjectSocket } from '../hooks/useProjectSocket';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import KanbanColumn from '../components/tasks/KanbanColumn';
import TaskModal from '../components/tasks/TaskModal';
import MemberModal from '../components/projects/MemberModal';
import ProjectModal from '../components/projects/ProjectModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ActivityFeed from '../components/projects/ActivityFeed';
import UserAvatar from '../components/common/UserAvatar';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const COLUMNS = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'review', title: 'Review' },
  { status: 'done', title: 'Done' }
];

export default function ProjectBoard() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({ priority: '', assignee: '', search: '', sort: '' });

  const [taskModal, setTaskModal] = useState({ open: false, task: null, defaultStatus: 'todo' });
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tab, setTab] = useState('board');
  const [removeMemberTarget, setRemoveMemberTarget] = useState(null);

  const loadProject = () => projectService.getOne(id).then((res) => setProject(res.project));

  const loadTasks = (params) =>
    taskService.getForProject(id, params).then((res) => setTasks(res.tasks));

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([loadProject(), loadTasks()])
      .catch((err) => setError(err.response?.data?.message || 'Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const params = {};
    if (filters.priority) params.priority = filters.priority;
    if (filters.assignee) params.assignee = filters.assignee;
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    const t = setTimeout(() => loadTasks(Object.keys(params).length ? params : undefined), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, id]);

  const members = useMemo(
    () => (project ? [project.owner, ...project.members].filter(Boolean) : []),
    [project]
  );
  const isOwner = project?.owner?._id === user?._id;

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], review: [], done: [] };
    tasks.forEach((t) => g[t.status]?.push(t));
    return g;
  }, [tasks]);

  const progress = tasks.length ? Math.round((grouped.done.length / tasks.length) * 100) : 0;

  const handleDrop = async (taskId, newStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await taskService.update(taskId, { status: newStatus });
    } catch {
      loadTasks();
      push('Could not move task', 'error');
    }
  };

  const handleTaskSaved = (task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t._id === task._id);
      if (!exists) return [{ ...task, commentCount: task.commentCount ?? 0 }, ...prev];
      return prev.map((t) =>
        t._id === task._id ? { ...task, commentCount: task.commentCount ?? t.commentCount } : t
      );
    });
  };
  const handleTaskDeleted = (taskId) => setTasks((prev) => prev.filter((t) => t._id !== taskId));

  useProjectSocket(id, {
    onTaskCreated: (task) => setTasks((prev) => (prev.some((t) => t._id === task._id) ? prev : [{ ...task, commentCount: 0 }, ...prev])),
    onTaskUpdated: (task) => setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...task, commentCount: t.commentCount } : t))),
    onTaskDeleted: ({ taskId }) => setTasks((prev) => prev.filter((t) => t._id !== taskId)),
    onProjectUpdated: (updated) => setProject(updated)
  });

  const handleDeleteProject = async () => {
    await projectService.remove(id);
    push('Project deleted');
    navigate('/projects');
  };

  const handleRemoveMember = async () => {
    if (!removeMemberTarget) return;
    await projectService.removeMember(id, removeMemberTarget._id);
    setProject((p) => ({ ...p, members: p.members.filter((m) => m._id !== removeMemberTarget._id) }));
    push('Member removed');
    setRemoveMemberTarget(null);
  };

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!project) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-ink">{project.title}</h1>
            {project.description && <p className="mt-1 text-sm text-ink-soft">{project.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setEditProjectOpen(true)}>
              Edit
            </Button>
            {isOwner && (
              <Button variant="danger" onClick={() => setDeleteConfirmOpen(true)}>
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex -space-x-2">
            {members.map((m) => (
              <UserAvatar key={m._id} user={m} className="ring-2 ring-surface" />
            ))}
            <button
              onClick={() => setMemberModalOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-line text-ink-soft ring-2 ring-surface hover:border-brand hover:text-brand"
              aria-label="Add member"
            >
              +
            </button>
          </div>
          <div className="flex min-w-[160px] flex-1 items-center gap-2 sm:max-w-xs">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
              <div className="h-full rounded-full bg-success" style={{ width: `${progress}%` }} />
            </div>
            <span className="shrink-0 text-xs font-medium text-ink-soft">{progress}% done</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-line">
        {['board', 'members', 'activity'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'border-b-2 border-brand text-brand-ink' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'board' && (
        <>
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-brand"
        />
        <select
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          className="rounded-lg border border-line px-2 py-1.5 text-sm capitalize outline-none focus:border-brand"
        >
          <option value="">All priorities</option>
          {['low', 'medium', 'high', 'urgent'].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={filters.assignee}
          onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
          className="rounded-lg border border-line px-2 py-1.5 text-sm outline-none focus:border-brand"
        >
          <option value="">All assignees</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          className="rounded-lg border border-line px-2 py-1.5 text-sm outline-none focus:border-brand"
        >
          <option value="">Sort: newest</option>
          <option value="dueDate">Sort: due date</option>
          <option value="priority">Sort: priority</option>
        </select>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={grouped[col.status]}
            onTaskClick={(task) => setTaskModal({ open: true, task, defaultStatus: col.status })}
            onDrop={handleDrop}
            onAddClick={() => setTaskModal({ open: true, task: null, defaultStatus: col.status })}
          />
        ))}
      </div>
        </>
      )}

      {tab === 'members' && (
        <div className="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface">
          {members.map((m) => {
            const memberIsOwner = m._id === project.owner._id;
            return (
              <div key={m._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <UserAvatar user={m} />
                  <div>
                    <p className="text-sm font-medium text-ink">{m.name}</p>
                    <p className="text-xs text-ink-soft">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-canvas px-2 py-0.5 text-xs font-medium text-ink-soft">
                    {memberIsOwner ? 'Owner' : 'Member'}
                  </span>
                  {isOwner && !memberIsOwner && (
                    <button
                      onClick={() => setRemoveMemberTarget(m)}
                      className="text-xs font-medium text-danger hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div className="px-4 py-3">
            <Button variant="secondary" onClick={() => setMemberModalOpen(true)}>
              Add member
            </Button>
          </div>
        </div>
      )}

      {tab === 'activity' && <ActivityFeed projectId={id} />}

      <TaskModal
        open={taskModal.open}
        onClose={() => setTaskModal((m) => ({ ...m, open: false }))}
        task={taskModal.task}
        projectId={id}
        members={members}
        defaultStatus={taskModal.defaultStatus}
        onSaved={handleTaskSaved}
        onDeleted={handleTaskDeleted}
      />

      <MemberModal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        projectId={id}
        existingMemberIds={members.map((m) => m._id)}
        onAdded={(updated) => setProject(updated)}
      />

      <ProjectModal
        open={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        project={project}
        onSaved={(updated) => setProject(updated)}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete project"
        message="This permanently deletes the project and all its tasks."
        confirmLabel="Delete"
      />

      <ConfirmationDialog
        open={Boolean(removeMemberTarget)}
        onClose={() => setRemoveMemberTarget(null)}
        onConfirm={handleRemoveMember}
        title="Remove member"
        message={`Remove ${removeMemberTarget?.name} from this project?`}
        confirmLabel="Remove"
      />
    </div>
  );
}
