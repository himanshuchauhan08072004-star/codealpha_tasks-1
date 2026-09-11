export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span
        className={`animate-spin rounded-full border-brand border-t-transparent ${sizes[size]}`}
      />
    </div>
  );
}
