import { useEffect, useState } from 'react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import api from '../utils/api';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export default function BookPage() {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [step, setStep] = useState(1); // 1=lista, 2=booking (mobil)
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

  const handleSelect = (p) => {
    setSelected(p);
    setStep(2); // pe mobil mergi la pasul 2
  };

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
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la programare.');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
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
      <div className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl text-gray-900">Caută psiholog</h2>
        <p className="text-gray-500 text-sm mt-1">Alege un specialist și programează o sesiune.</p>
      </div>

      {/* Mobile step indicator */}
      <div className="md:hidden flex items-center gap-2 mb-5">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
            step === 1 ? 'bg-primary-600 text-white' : 'text-gray-400'
          }`}
        >
          1 · Alege psiholog
        </button>
        <span className="text-gray-300">›</span>
        <button
          disabled={!selected}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
            step === 2 ? 'bg-primary-600 text-white' : 'text-gray-400 disabled:opacity-40'
          }`}
        >
          2 · Alege ora
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Psychologist list — vizibil pe desktop mereu, pe mobil doar la step 1 */}
        <div className={`space-y-3 ${step === 2 ? 'hidden md:block' : ''}`}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Caută după nume sau specializare..."
            className="input"
          />

          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Se încarcă...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Niciun psiholog găsit.</p>
          ) : (
            filtered.map((p) => (
              <PsychologistCard
                key={p._id}
                psychologist={p}
                isSelected={selected?._id === p._id}
                onSelect={() => handleSelect(p)}
              />
            ))
          )}
        </div>

        {/* Booking form — vizibil pe desktop mereu, pe mobil doar la step 2 */}
        <div className={`${step === 1 ? 'hidden md:block' : ''}`}>
          {selected ? (
            <div className="card">
              {/* Back button pe mobil */}
              <button
                onClick={() => setStep(1)}
                className="md:hidden flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
              >
                ← Înapoi la lista
              </button>

              <h3 className="font-display text-xl text-gray-900 mb-0.5">
                {selected.firstName} {selected.lastName}
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
                        className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
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

                <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
                  {submitting ? 'Se trimite...' : 'Trimite cererea'}
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex card items-center justify-center h-64 text-center">
              <div>
                <p className="text-4xl mb-3">👈</p>
                <p className="text-gray-400 text-sm">Selectează un psiholog din listă</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PsychologistCard({ psychologist: p, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`card cursor-pointer transition-all active:scale-[0.99] ${
        isSelected ? 'ring-2 ring-primary-500 border-primary-200' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold shrink-0">
          {p.firstName[0]}{p.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm">
              {p.firstName} {p.lastName}
            </p>
            {p.psychologistProfile?.isVerified && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✓ Verificat</span>
            )}
          </div>
          <p className="text-sm text-primary-600 mt-0.5">
            {p.psychologistProfile?.specialization || 'Psiholog'}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
            {p.psychologistProfile?.yearsExperience > 0 && (
              <span>⏱ {p.psychologistProfile.yearsExperience} ani</span>
            )}
            {p.psychologistProfile?.pricePerSession > 0 && (
              <span>💰 {p.psychologistProfile.pricePerSession} RON</span>
            )}
          </div>
        </div>
        <span className="text-gray-300 shrink-0">›</span>
      </div>
    </div>
  );
}
