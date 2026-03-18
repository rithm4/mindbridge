import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_CONFIG = {
  pending:   { label: 'În așteptare', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmată',   color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Anulată',      color: 'bg-red-100 text-red-800' },
  completed: { label: 'Finalizată',   color: 'bg-gray-100 text-gray-700' },
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = () => {
    setLoading(true);
    api.get('/appointments')
      .then(({ data }) => setAppointments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchAppointments, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/appointments/${id}/status`, { status });
      setAppointments((prev) => prev.map((a) => (a._id === id ? data : a)));
    } catch (err) {
      alert(err.response?.data?.message || 'Eroare la actualizare.');
    }
  };

  const filtered = appointments.filter(
    (a) => filter === 'all' || a.status === filter
  );

  const isPsychologist = user?.role === 'psychologist';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl text-gray-900">Programările mele</h2>
          <p className="text-gray-500 text-sm mt-1">Gestionează toate sesiunile tale.</p>
        </div>
        {!isPsychologist && (
          <Link to="/book" className="btn-primary text-sm">+ Programare nouă</Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
            }`}
          >
            {f === 'all' ? 'Toate' : STATUS_CONFIG[f]?.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Se încarcă...</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400">Nicio programare găsită.</p>
          </div>
        ) : (
          filtered.map((apt) => (
            <AppointmentCard
              key={apt._id}
              apt={apt}
              role={user?.role}
              onUpdateStatus={updateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ apt, role, onUpdateStatus }) {
  const other = role === 'psychologist' ? apt.patient : apt.psychologist;
  const cfg = STATUS_CONFIG[apt.status];

  return (
    <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
          {other?.firstName?.[0]}{other?.lastName?.[0]}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {other?.firstName} {other?.lastName}
          </p>
          {role === 'patient' && apt.psychologist?.psychologistProfile?.specialization && (
            <p className="text-xs text-gray-400">
              {apt.psychologist.psychologistProfile.specialization}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-0.5">
            📅 {format(new Date(apt.startTime), "EEEE, d MMMM yyyy 'la' HH:mm", { locale: ro })}
            <span className="ml-2 text-gray-400">({apt.duration} min)</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`badge ${cfg.color}`}>{cfg.label}</span>

        {/* Psihologul poate confirma */}
        {role === 'psychologist' && apt.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(apt._id, 'confirmed')}
            className="btn-primary text-xs py-1.5 px-3"
          >
            ✓ Confirmă
          </button>
        )}

        {/* Ambii pot anula */}
        {['pending', 'confirmed'].includes(apt.status) && (
          <button
            onClick={() => onUpdateStatus(apt._id, 'cancelled')}
            className="text-xs px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            ✕ Anulează
          </button>
        )}

        {/* Intră în apel video */}
        {apt.status === 'confirmed' && (
          <Link
            to={`/call/${apt.videoRoomId}`}
            className="btn-primary text-xs py-1.5 px-3"
          >
            📹 Intră în sesiune
          </Link>
        )}

        {/* Marchează finalizată */}
        {role === 'psychologist' && apt.status === 'confirmed' && (
          <button
            onClick={() => onUpdateStatus(apt._id, 'completed')}
            className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ✓ Finalizată
          </button>
        )}
      </div>
    </div>
  );
}
