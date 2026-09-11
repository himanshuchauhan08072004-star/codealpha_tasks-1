import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas text-center">
      <h1 className="text-3xl font-extrabold text-ink">404</h1>
      <p className="text-sm text-ink-soft">This page doesn't exist.</p>
      <Link to="/" className="text-sm font-semibold text-brand">
        Back to dashboard
      </Link>
    </div>
  );
}
