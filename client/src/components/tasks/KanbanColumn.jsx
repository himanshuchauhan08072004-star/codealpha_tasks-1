import TaskCard from './TaskCard';

export default function KanbanColumn({ title, status, tasks, onTaskClick, onDrop, onAddClick }) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) onDrop(taskId, status);
      }}
      className="flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-canvas p-3"
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-ink">
          {title} <span className="text-ink-soft">({tasks.length})</span>
        </h3>
        <button
          onClick={onAddClick}
          aria-label={`Add task to ${title}`}
          className="rounded-md px-1.5 text-ink-soft hover:bg-surface hover:text-ink"
        >
          +
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={() => onTaskClick(task)}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', task._id)}
          />
        ))}
        {tasks.length === 0 && (
          <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-ink-soft">
            No tasks
          </p>
        )}
      </div>
    </div>
  );
}
