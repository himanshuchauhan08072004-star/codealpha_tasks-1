import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { useToast } from '../../hooks/useToast';
import { projectService } from '../../services/projectService';

export default function ProjectModal({ open, onClose, onSaved, project }) {
  const isEdit = Boolean(project);
  const { push } = useToast();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (open) {
      reset({
        title: project?.title || '',
        description: project?.description || '',
        deadline: project?.deadline ? project.deadline.slice(0, 10) : ''
      });
      setServerError('');
    }
  }, [open, project, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const res = isEdit
        ? await projectService.update(project._id, data)
        : await projectService.create(data);
      onSaved(res.project);
      push(isEdit ? 'Project updated' : 'Project created');
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not save project');
      push('Could not save project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit project' : 'New project'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={loading}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <ErrorMessage message={serverError} />
        <Input
          id="title"
          label="Title"
          placeholder="Website redesign"
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
            placeholder="What's this project about?"
            className="rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand"
            {...register('description')}
          />
        </div>
        <Input id="deadline" label="Deadline" type="date" {...register('deadline')} />
      </form>
    </Modal>
  );
}
