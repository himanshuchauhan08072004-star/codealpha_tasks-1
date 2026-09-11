import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmationDialog from '../common/ConfirmationDialog';
import CommentSection from '../comments/CommentSection';
import { useToast } from '../../hooks/useToast';
import { taskService } from '../../services/taskService';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' }
];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

export default function TaskModal({ open, onClose, task, projectId, members, defaultStatus, onSaved, onDeleted }) {
  const isEdit = Boolean(task);
  const { push } = useToast();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (open) {
      reset({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || defaultStatus || 'todo',
        priority: task?.priority || 'medium',
        assignee: task?.assignee?._id || '',
        dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : ''
      });
      setServerError('');
    }
  }, [open, task, defaultStatus, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    const payload = { ...data, assignee: data.assignee || null };
    try {
      const res = isEdit
        ? await taskService.update(task._id, payload)
        : await taskService.create(projectId, payload);
      onSaved(res.task);
      push(isEdit ? 'Task updated' : 'Task created');
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not save task');
      push('Could not save task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await taskService.remove(task._id);
    onDeleted(task._id);
    push('Task deleted');
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEdit ? 'Task details' : 'New task'}
        size="lg"
        footer={
          <>
            {isEdit && (
              <Button variant="danger" onClick={() => setConfirmOpen(true)} className="mr-auto">
                Delete
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={loading}>
              {isEdit ? 'Save changes' : 'Create task'}
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <ErrorMessage message={serverError} />
          <Input
            id="title"
            label="Title"
            error={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-ink">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="status" className="text-sm font-medium text-ink">
                Status
              </label>
              <select
                id="status"
                className="rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                {...register('status')}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="priority" className="text-sm font-medium text-ink">
                Priority
              </label>
              <select
                id="priority"
                className="rounded-lg border border-line px-3 py-2 text-sm capitalize text-ink outline-none focus:border-brand"
                {...register('priority')}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="assignee" className="text-sm font-medium text-ink">
                Assignee
              </label>
              <select
                id="assignee"
                className="rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                {...register('assignee')}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <Input id="dueDate" label="Due date" type="date" {...register('dueDate')} />
          </div>
        </form>

        {isEdit && (
          <div className="mt-6 border-t border-line pt-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Comments</h3>
            <CommentSection taskId={task._id} />
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete task"
        message="This will permanently delete the task and its comments."
        confirmLabel="Delete"
      />
    </>
  );
}
