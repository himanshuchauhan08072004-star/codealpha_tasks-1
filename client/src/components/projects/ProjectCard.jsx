import { Link } from 'react-router-dom';
import UserAvatar from '../common/UserAvatar';

const STATUS_STYLE = {
  active: 'bg-brand-soft text-brand-ink',
  completed: 'bg-success-soft text-success',
  archived: 'bg-canvas text-ink-soft'
};

export default function ProjectCard({ project }) {
  const members = [project.owner, ...project.members].filter(Boolean);

  return (
    <Link
      to={`/projects/${project._id}`}
      className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-brand"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-ink">{project.title}</h3>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[project.status]}`}>
          {project.status}
        </span>
      </div>
      {project.description && (
        <p className="line-clamp-2 text-sm text-ink-soft">{project.description}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-2">
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((m) => (
            <UserAvatar key={m._id} user={m} size="sm" className="ring-2 ring-surface" />
          ))}
        </div>
        {project.deadline && (
          <span className="text-xs text-ink-soft">
            Due {new Date(project.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
    </Link>
  );
}
