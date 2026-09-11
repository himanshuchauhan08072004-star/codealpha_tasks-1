const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };
const COLORS = {
  todo: 'bg-ink-soft', in_progress: 'bg-brand', review: 'bg-amber', done: 'bg-success',
  low: 'bg-ink-soft', medium: 'bg-brand', high: 'bg-amber', urgent: 'bg-danger'
};

export default function BreakdownBars({ title, data, labelMap }) {
  const map = labelMap === 'priority' ? PRIORITY_LABEL : STATUS_LABEL;
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-4 flex flex-col gap-3">
        {data.length === 0 && <p className="text-sm text-ink-soft">No tasks yet.</p>}
        {data.map((d) => (
          <div key={d._id}>
            <div className="mb-1 flex items-center justify-between text-xs text-ink-soft">
              <span>{map[d._id] || d._id}</span>
              <span>{d.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className={`h-full rounded-full ${COLORS[d._id] || 'bg-brand'}`}
                style={{ width: `${(d.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
