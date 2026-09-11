import { Link } from 'react-router-dom';
import UserAvatar from '../common/UserAvatar';

export default function UpcomingDeadlines({ tasks }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">Upcoming deadlines</h3>
      <div className="mt-3 flex flex-col divide-y divide-line">
        {tasks.length === 0 && <p className="py-3 text-sm text-ink-soft">Nothing due soon.</p>}
        {tasks.map((t) => (
          <Link
            key={t._id}
            to={`/projects/${t.project?._id}`}
            className="flex items-center justify-between gap-3 py-3 text-sm hover:text-brand"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{t.title}</p>
              <p className="truncate text-xs text-ink-soft">{t.project?.title}</p>
            </div>
            <span className="shrink-0 text-xs text-ink-soft">
              {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
