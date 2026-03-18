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
      <div className="mb-8">
        <h2 className="font-display text-3xl text-gray-900">
          Bună ziua, {user?.firstName}! 👋
        </h2>
        <p className="text-gray-500 mt-1">
          {isPsychologist
            ? 'Iată programările tale pentru azi.'
            : 'Caută un psiholog și programează o sesiune.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Programări totale"
          value={appointments.length}
          icon="📋"
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Viitoare"
          value={appointments.filter((a) => isAfter(new Date(a.startTime), new Date()) && a.status !== 'cancelled').length}
          icon="📅"
          color="bg-green-50 text-green-700"
        />
        <StatCard
          label="Finalizate"
          value={appointments.filter((a) => a.status === 'completed').length}
          icon="✅"
          color="bg-purple-50 text-purple-700"
        />
      </div>

      {/* Upcoming appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-gray-900">Programări viitoare</h3>
          <Link to="/appointments" className="text-sm text-primary-600 hover:underline font-medium">
            Vezi toate →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Se încarcă...</div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Nu ai programări viitoare.</p>
            {!isPsychologist && (
              <Link to="/book" className="btn-primary inline-block mt-4 text-sm">
                + Programează o sesiune
              </Link>
            )}
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
  return (
    <div className={`rounded-2xl p-5 ${color.split(' ')[0]} border border-${color.split(' ')[0].replace('bg-', '')}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color.split(' ')[1]}`}>{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function AppointmentRow({ apt, role }) {
  const other = role === 'psychologist' ? apt.patient : apt.psychologist;
  const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
          {other?.firstName?.[0]}{other?.lastName?.[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {other?.firstName} {other?.lastName}
          </p>
          <p className="text-xs text-gray-400">
            {format(new Date(apt.startTime), "d MMMM, HH:mm", { locale: ro })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`badge ${cfg.color}`}>{cfg.label}</span>
        {apt.status === 'confirmed' && (
          <Link
            to={`/call/${apt.videoRoomId}`}
            className="btn-primary text-xs py-1.5 px-3"
          >
            📹 Intră
          </Link>
        )}
      </div>
    </div>
  );
}
