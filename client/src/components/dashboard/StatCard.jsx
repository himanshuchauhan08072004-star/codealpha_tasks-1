export default function StatCard({ label, value, accent = 'brand' }) {
  const accents = {
    brand: 'text-brand-ink bg-brand-soft',
    amber: 'text-amber bg-amber-soft',
    success: 'text-success bg-success-soft',
    danger: 'text-danger bg-danger-soft'
  };
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${accents[accent]}`}>
        {label}
      </span>
      <div className="mt-3 text-3xl font-extrabold text-ink">{value}</div>
    </div>
  );
}
