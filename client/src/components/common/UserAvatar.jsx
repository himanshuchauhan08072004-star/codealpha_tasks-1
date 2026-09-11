const palette = ['#3548C4', '#C77E1A', '#2A8A63', '#C0392B', '#6D28D9', '#0F766E'];

function colorFor(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const sizes = { sm: 'h-6 w-6 text-[10px]', md: 'h-8 w-8 text-xs', lg: 'h-10 w-10 text-sm' };

export default function UserAvatar({ user, size = 'md', className = '' }) {
  const name = user?.name || '?';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={name}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <span
      title={name}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]} ${className}`}
      style={{ backgroundColor: colorFor(user?._id || name) }}
    >
      {initials}
    </span>
  );
}
