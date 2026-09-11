import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { projectService } from '../../services/projectService';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import UserAvatar from '../common/UserAvatar';
import ErrorMessage from '../common/ErrorMessage';
import { useToast } from '../../hooks/useToast';

export default function MemberModal({ open, onClose, projectId, existingMemberIds, onAdded }) {
  const { push } = useToast();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      userService.search(search).then((res) => setResults(res.users));
    }, 300);
    return () => clearTimeout(t);
  }, [search, open]);

  const addMember = async (userId) => {
    setAddingId(userId);
    setError('');
    try {
      const res = await projectService.addMember(projectId, userId);
      onAdded(res.project);
      push('Member added');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add member');
      push('Could not add member', 'error');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add member" size="sm">
      <div className="flex flex-col gap-3">
        <ErrorMessage message={error} />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {results.map((u) => {
            const already = existingMemberIds.includes(u._id);
            return (
              <div key={u._id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-canvas">
                <div className="flex items-center gap-2 min-w-0">
                  <UserAvatar user={u} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{u.name}</p>
                    <p className="truncate text-xs text-ink-soft">{u.email}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  disabled={already}
                  loading={addingId === u._id}
                  onClick={() => addMember(u._id)}
                >
                  {already ? 'Added' : 'Add'}
                </Button>
              </div>
            );
          })}
          {results.length === 0 && <p className="py-4 text-center text-sm text-ink-soft">No users found.</p>}
        </div>
      </div>
    </Modal>
  );
}
