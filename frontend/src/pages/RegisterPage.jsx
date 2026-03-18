import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SPECIALIZATIONS = [
  'Psihoterapie cognitiv-comportamentală',
  'Psihanaliză',
  'Terapie de familie',
  'Psihologie clinică',
  'Psihoterapie integrativă',
  'Terapie prin artă',
  'Altele',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Parola trebuie să aibă minim 8 caractere.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la înregistrare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-primary-700 text-2xl">MindBridge</h1>
          <h2 className="font-display text-3xl text-gray-900 mt-2">Creează cont</h2>
          <p className="text-gray-500 text-sm mt-1">Alege rolul și completează datele.</p>
        </div>

        <div className="card">
          {/* Role toggle */}
          <div className="flex rounded-xl border border-gray-200 p-1 mb-6">
            {['patient', 'psychologist'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role }))}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  form.role === role
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {role === 'patient' ? '🔵 Pacient' : '🟢 Psiholog'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prenume</label>
                <input name="firstName" value={form.firstName} onChange={handleChange}
                  className="input" placeholder="Ion" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nume</label>
                <input name="lastName" value={form.lastName} onChange={handleChange}
                  className="input" placeholder="Popescu" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="input" placeholder="email@exemplu.com" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parolă</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                className="input" placeholder="Minim 8 caractere" required />
            </div>

            {form.role === 'psychologist' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specializare</label>
                <select name="specialization" value={form.specialization}
                  onChange={handleChange} className="input">
                  <option value="">Selectează specializarea</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Se creează contul...' : 'Creează cont'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Ai deja cont?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Autentifică-te
          </Link>
        </p>
      </div>
    </div>
  );
}
