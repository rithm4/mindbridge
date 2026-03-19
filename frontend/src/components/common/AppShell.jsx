import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',    label: 'Acasă',      icon: '🏠' },
  { to: '/appointments', label: 'Programări', icon: '📅' },
  { to: '/calendar',     label: 'Calendar',   icon: '🗓' },
  { to: '/book',         label: 'Caută',      icon: '🔍', role: 'patient' },
  { to: '/profile',      label: 'Profil',     icon: '👤' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleItems = navItems.filter(
    (item) => !item.role || item.role === user?.role
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── SIDEBAR (desktop) ─────────────────────────────── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-100 flex-col py-6 px-4 shrink-0 fixed h-full z-20">
        <div className="mb-8 px-2">
          <h1 className="font-display text-2xl text-primary-700">MindBridge</h1>
          <p className="text-xs text-gray-400 mt-0.5">Psihologie online</p>
        </div>

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

        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400">
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

      {/* ── MOBILE HEADER ─────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="font-display text-xl text-primary-700">MindBridge</h1>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-gray-50"
        >
          <span className={`block w-5 h-0.5 bg-gray-600 transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </header>

      {/* ── MOBILE DRAWER MENU ────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-20" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute top-14 left-0 right-0 bg-white border-b border-gray-100 px-4 py-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {visibleItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <span className="text-lg">{icon}</span>
                {label}
              </NavLink>
            ))}
            <div className="border-t border-gray-100 pt-3 mt-3">
              <p className="text-xs text-gray-400 px-3 mb-2">
                {user?.firstName} {user?.lastName} · {user?.role === 'psychologist' ? 'Psiholog' : 'Pacient'}
              </p>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                ↩ Deconectare
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 md:ml-60 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 mt-14 md:mt-0 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* ── BOTTOM NAV (mobile) ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 safe-area-pb">
        {visibleItems.slice(0, 5).map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[48px] ${
                isActive ? 'text-primary-700' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  );
}
