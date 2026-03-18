import { useEffect, useState } from 'react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { ro } from 'date-fns/locale';
import api from '../utils/api';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export default function BookPage() {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [booking, setBooking] = useState({ date: '', time: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/appointments/psychologists')
      .then(({ data }) => setPsychologists(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = psychologists.filter((p) => {
    const q = search.toLowerCase();
    return (
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.psychologistProfile?.specialization?.toLowerCase().includes(q)
    );
  });

  const handleBook = async (e) => {
    e.preventDefault();
    if (!booking.date || !booking.time) {
      setError('Selectează data și ora.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const [h, m] = booking.time.split(':');
      const startTime = setMinutes(setHours(new Date(booking.date), +h), +m);
      await api.post('/appointments', {
        psychologistId: selected._id,
        startTime: startTime.toISOString(),
        notes: booking.notes,
      });
      setSuccess(true);
      setSelected(null);
      setBooking({ date: '', time: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la programare.');
    } finally {
      setSubmitting(false);
    }
  };

  // Min date = tomorrow
  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="font-display text-2xl text-gray-900 mb-2">Programare trimisă!</h2>
        <p className="text-gray-500 text-sm mb-6">Psihologul va confirma în curând.</p>
        <button onClick={() => setSuccess(false)} className="btn-primary">
          Programează altă sesiune
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl text-gray-900">Caută psiholog</h2>
        <p className="text-gray-500 text-sm mt-1">Alege un specialist și programează o sesiune.</p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍  Caută după nume sau specializare..."
        className="input mb-6 max-w-md"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Psychologist list */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-400 text-sm">Se încarcă...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-sm">Niciun psiholog găsit.</p>
          ) : (
            filtered.map((p) => (
              <PsychologistCard
                key={p._id}
                psychologist={p}
                isSelected={selected?._id === p._id}
                onSelect={() => setSelected(selected?._id === p._id ? null : p)}
              />
            ))
          )}
        </div>

        {/* Booking form */}
        {selected && (
          <div className="card sticky top-6 h-fit">
            <h3 className="font-display text-xl text-gray-900 mb-1">
              Programare cu {selected.firstName} {selected.lastName}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {selected.psychologistProfile?.specialization}
            </p>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  min={minDate}
                  value={booking.date}
                  onChange={(e) => setBooking((p) => ({ ...p, date: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ora</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBooking((p) => ({ ...p, time: slot }))}
                      className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                        booking.time === slot
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notă (opțional)
                </label>
                <textarea
                  value={booking.notes}
                  onChange={(e) => setBooking((p) => ({ ...p, notes: e.target.value }))}
                  className="input resize-none"
                  rows={3}
                  placeholder="Descrie pe scurt motivul consultației..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? 'Se trimite...' : 'Trimite cererea'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function PsychologistCard({ psychologist: p, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`card cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary-500 border-primary-200' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg shrink-0">
          {p.firstName[0]}{p.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">
              {p.firstName} {p.lastName}
            </p>
            {p.psychologistProfile?.isVerified && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✓ Verificat</span>
            )}
          </div>
          <p className="text-sm text-primary-600 mt-0.5">
            {p.psychologistProfile?.specialization || 'Psiholog'}
          </p>
          {p.psychologistProfile?.bio && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {p.psychologistProfile.bio}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            {p.psychologistProfile?.yearsExperience > 0 && (
              <span>⏱ {p.psychologistProfile.yearsExperience} ani exp.</span>
            )}
            {p.psychologistProfile?.pricePerSession > 0 && (
              <span>💰 {p.psychologistProfile.pricePerSession} RON/sesiune</span>
            )}
          </div>
        </div>
        <span className={`text-sm font-medium ${isSelected ? 'text-primary-600' : 'text-gray-300'}`}>
          {isSelected ? '✓' : '›'}
        </span>
      </div>
    </div>
  );
}
