import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la autentificare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding (doar desktop) */}
      <div className="hidden lg:flex w-1/2 bg-primary-600 flex-col justify-between p-12">
        <h1 className="font-display text-white text-3xl">MindBridge</h1>
        <div>
          <p className="font-display italic text-white/80 text-4xl leading-snug">
            "Sănătatea mentală<br />contează."
          </p>
          <p className="text-primary-200 mt-4 text-sm">
            Conectăm pacienții cu psihologi verificați, online, simplu și sigur.
          </p>
        </div>
        <p className="text-primary-300 text-xs">© 2024 MindBridge</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 bg-gray-50 min-h-screen">
        <div className="w-full max-w-sm">

          {/* Logo pe mobil */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-display text-2xl">M</span>
            </div>
            <h1 className="font-display text-2xl text-primary-700">MindBridge</h1>
            <p className="text-sm text-gray-400 mt-1">Psihologie online</p>
          </div>

          <div className="mb-6">
            <h2 className="font-display text-3xl text-gray-900">Bun venit!</h2>
            <p className="text-gray-500 mt-1 text-sm">Autentifică-te în contul tău.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="email@exemplu.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parolă</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Se autentifică...' : 'Autentificare'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Nu ai cont?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Înregistrează-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
