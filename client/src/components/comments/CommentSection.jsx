import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { commentService } from '../../services/commentService';
import { getSocket } from '../../services/socket';
import UserAvatar from '../common/UserAvatar';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

export default function CommentSection({ taskId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    setLoading(true);
    commentService
      .getForTask(taskId)
      .then((res) => setComments(res.comments))
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => {
    const socket = getSocket();

    const onCreated = ({ taskId: tId, comment }) => {
      if (tId !== taskId) return;
      setComments((prev) => (prev.some((c) => c._id === comment._id) ? prev : [...prev, comment]));
    };
    const onUpdated = ({ taskId: tId, comment }) => {
      if (tId !== taskId) return;
      setComments((prev) => prev.map((c) => (c._id === comment._id ? comment : c)));
    };
    const onDeleted = ({ taskId: tId, commentId }) => {
      if (tId !== taskId) return;
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    };

    socket.on('comment:created', onCreated);
    socket.on('comment:updated', onUpdated);
    socket.on('comment:deleted', onDeleted);

    return () => {
      socket.off('comment:created', onCreated);
      socket.off('comment:updated', onUpdated);
      socket.off('comment:deleted', onDeleted);
    };
  }, [taskId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await commentService.create(taskId, text.trim());
      setComments((prev) => [...prev, res.comment]);
      setText('');
    } finally {
      setPosting(false);
    }
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    const res = await commentService.update(id, editText.trim());
    setComments((prev) => prev.map((c) => (c._id === id ? res.comment : c)));
    setEditingId(null);
  };

  const remove = async (id) => {
    await commentService.remove(id);
    setComments((prev) => prev.filter((c) => c._id !== id));
  };

  if (loading) return <LoadingSpinner size="sm" className="py-4" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {comments.length === 0 && <p className="text-sm text-ink-soft">No comments yet.</p>}
        {comments.map((c) => (
          <div key={c._id} className="flex gap-3">
            <UserAvatar user={c.author} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="rounded-lg bg-canvas px-3 py-2">
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink">{c.author?.name}</span>
                  <span className="text-[11px] text-ink-soft">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                {editingId === c._id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-line px-2 py-1 text-sm outline-none focus:border-brand"
                    />
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => saveEdit(c._id)}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-ink">{c.content}</p>
                )}
              </div>
              {c.author?._id === user?._id && editingId !== c._id && (
                <div className="mt-1 flex gap-3 px-1 text-xs text-ink-soft">
                  <button
                    onClick={() => {
                      setEditingId(c._id);
                      setEditText(c.content);
                    }}
                    className="hover:text-ink"
                  >
                    Edit
                  </button>
                  <button onClick={() => remove(c._id)} className="hover:text-danger">
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <Button type="submit" loading={posting}>
          Post
        </Button>
      </form>
    </div>
  );
}
