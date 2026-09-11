const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };

export default function RecentActivity({ tasks }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">Recent activity</h3>
      <div className="mt-3 flex flex-col divide-y divide-line">
        {tasks.length === 0 && <p className="py-3 text-sm text-ink-soft">No activity yet.</p>}
        {tasks.map((t) => (
          <div key={t._id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{t.title}</p>
              <p className="truncate text-xs text-ink-soft">{t.project?.title}</p>
            </div>
            <span className="shrink-0 rounded-md bg-canvas px-2 py-0.5 text-xs font-medium text-ink-soft">
              {STATUS_LABEL[t.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
