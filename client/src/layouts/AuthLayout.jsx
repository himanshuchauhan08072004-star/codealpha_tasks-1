import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-xl font-extrabold tracking-tight text-brand">Flowline</span>
          <p className="mt-1 text-sm text-ink-soft">Plan work. Ship it. Track it.</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
