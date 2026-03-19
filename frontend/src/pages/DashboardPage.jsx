import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isAfter } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_CONFIG = {
  pending:   { label: 'În așteptare', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmată',   color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Anulată',      color: 'bg-red-100 text-red-800' },
  completed: { label: 'Finalizată',   color: 'bg-gray-100 text-gray-700' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then(({ data }) => setAppointments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(
    (a) => isAfter(new Date(a.startTime), new Date()) && a.status !== 'cancelled'
  ).slice(0, 3);

  const isPsychologist = user?.role === 'psychologist';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl text-gray-900">
          Bună ziua, {user?.firstName}! 👋
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          {isPsychologist
            ? 'Iată programările tale pentru azi.'
            : 'Caută un psiholog și programează o sesiune.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Total"
          value={appointments.length}
          icon="📋"
          color="blue"
        />
        <StatCard
          label="Viitoare"
          value={appointments.filter((a) => isAfter(new Date(a.startTime), new Date()) && a.status !== 'cancelled').length}
          icon="📅"
          color="green"
        />
        <StatCard
          label="Finalizate"
          value={appointments.filter((a) => a.status === 'completed').length}
          icon="✅"
          color="purple"
        />
      </div>

      {/* Quick action pentru pacient */}
      {!isPsychologist && (
        <Link
          to="/book"
          className="btn-primary flex items-center justify-center gap-2 w-full mb-6 py-3"
        >
          <span>+</span> Programează o sesiune nouă
        </Link>
      )}

      {/* Upcoming appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg md:text-xl text-gray-900">Programări viitoare</h3>
          <Link to="/appointments" className="text-sm text-primary-600 hover:underline font-medium">
            Vezi toate →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Se încarcă...</div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Nu ai programări viitoare.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <AppointmentRow key={apt._id} apt={apt} role={user?.role} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className={`rounded-2xl p-3 md:p-5 ${colors[color].split(' ')[0]}`}>
      <div className="text-xl md:text-2xl mb-1">{icon}</div>
      <p className={`text-xl md:text-3xl font-bold ${colors[color].split(' ')[1]}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function AppointmentRow({ apt, role }) {
  const other = role === 'psychologist' ? apt.patient : apt.psychologist;
  const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
          {other?.firstName?.[0]}{other?.lastName?.[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {other?.firstName} {other?.lastName}
          </p>
          <p className="text-xs text-gray-400">
            {format(new Date(apt.startTime), "d MMM, HH:mm", { locale: ro })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`badge ${cfg.color} hidden sm:inline-flex`}>{cfg.label}</span>
        {apt.status === 'confirmed' && (
          <Link to={`/call/${apt.videoRoomId}`} className="btn-primary text-xs py-1.5 px-3">
            📹
          </Link>
        )}
      </div>
    </div>
  );
}
