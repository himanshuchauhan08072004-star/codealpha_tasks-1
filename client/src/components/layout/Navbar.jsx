import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../common/UserAvatar';
import Dropdown from '../common/Dropdown';
import NotificationBell from './NotificationBell';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-4 md:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Toggle menu"
        className="rounded-md p-2 text-ink-soft hover:bg-canvas lg:hidden"
      >
        ☰
      </button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-1">
        <NotificationBell />
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-full pr-1">
              <UserAvatar user={user} />
              <span className="hidden text-sm font-medium text-ink sm:inline">{user?.name}</span>
            </button>
          }
          items={[
            { label: 'Profile', onClick: () => navigate('/profile') },
            { divider: true },
            {
              label: 'Log out',
              danger: true,
              onClick: () => {
                logout();
                navigate('/login');
              }
            }
          ]}
        />
      </div>
    </header>
  );
}
