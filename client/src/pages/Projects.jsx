import { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = (params) => {
    setLoading(true);
    setError('');
    projectService
      .getAll(params)
      .then((res) => setProjects(res.projects))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  useEffect(() => {
    const t = setTimeout(() => load(search ? { search } : undefined), 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-ink">Projects</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56"
          />
          <Button onClick={() => setModalOpen(true)}>New project</Button>
        </div>
      </div>

      {loading && <LoadingSpinner size="lg" className="py-20" />}
      {!loading && error && <ErrorMessage message={error} onRetry={() => load()} />}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing work."
          action={<Button onClick={() => setModalOpen(true)}>New project</Button>}
        />
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(project) => setProjects((prev) => [project, ...prev])}
      />
    </div>
  );
}
