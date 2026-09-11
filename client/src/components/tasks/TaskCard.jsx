import UserAvatar from '../common/UserAvatar';

const PRIORITY_STYLE = {
  low: 'bg-canvas text-ink-soft',
  medium: 'bg-brand-soft text-brand-ink',
  high: 'bg-amber-soft text-amber',
  urgent: 'bg-danger-soft text-danger'
};

export default function TaskCard({ task, onClick, onDragStart }) {
  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="flex cursor-pointer flex-col gap-2 rounded-lg border border-line bg-surface p-3 text-sm shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-ink">{task.title}</p>
        {task.assignee && <UserAvatar user={task.assignee} size="sm" />}
      </div>
      {task.description && (
        <p className="line-clamp-2 text-xs text-ink-soft">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLE[task.priority]}`}>
            {task.priority}
          </span>
          {task.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-ink-soft">
              💬 {task.commentCount}
            </span>
          )}
        </div>
        {task.dueDate && (
          <span className={`text-xs ${overdue ? 'font-semibold text-danger' : 'text-ink-soft'}`}>
            {overdue ? 'Overdue ' : ''}
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
