import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',    label: 'Acasă',        icon: '🏠' },
  { to: '/appointments', label: 'Programări',   icon: '📅' },
  { to: '/calendar',     label: 'Calendar',     icon: '🗓' },
  { to: '/book',         label: 'Caută',        icon: '🔍', role: 'patient' },
  { to: '/profile',      label: 'Profil',       icon: '👤' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleItems = navItems.filter(
    (item) => !item.role || item.role === user?.role
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
        {/* Logo */}
        <div className="mb-8 px-2">
          <h1 className="font-display text-2xl text-primary-700">MindBridge</h1>
          <p className="text-xs text-gray-400 mt-0.5">Psihologie online</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {visibleItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role === 'psychologist' ? '🟢 Psiholog' : '🔵 Pacient'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            ↩ Deconectare
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
