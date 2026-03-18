import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    ...(user?.role === 'psychologist'
      ? {
          bio:             user?.psychologistProfile?.bio || '',
          specialization:  user?.psychologistProfile?.specialization || '',
          pricePerSession: user?.psychologistProfile?.pricePerSession || '',
          yearsExperience: user?.psychologistProfile?.yearsExperience || '',
        }
      : {}),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const payload = {
        firstName: form.firstName,
        lastName:  form.lastName,
      };
      if (user?.role === 'psychologist') {
        payload.psychologistProfile = {
          bio:             form.bio,
          specialization:  form.specialization,
          pricePerSession: Number(form.pricePerSession),
          yearsExperience: Number(form.yearsExperience),
        };
      }
      const { data } = await api.patch('/users/me', payload);
      updateUser(data);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la salvare.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h2 className="font-display text-3xl text-gray-900">Profilul meu</h2>
        <p className="text-gray-500 text-sm mt-1">Actualizează informațiile contului tău.</p>
      </div>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-400">
            {user?.role === 'psychologist' ? '🟢 Psiholog' : '🔵 Pacient'} · {user?.email}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prenume</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nume</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="input" required />
          </div>
        </div>

        {user?.role === 'psychologist' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specializare</label>
              <input name="specialization" value={form.specialization} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="input resize-none"
                rows={3}
                placeholder="Descrie-ți experiența și abordarea terapeutică..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preț/sesiune (RON)</label>
                <input type="number" name="pricePerSession" value={form.pricePerSession}
                  onChange={handleChange} className="input" min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ani experiență</label>
                <input type="number" name="yearsExperience" value={form.yearsExperience}
                  onChange={handleChange} className="input" min={0} />
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            ✅ Profilul a fost actualizat.
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Se salvează...' : 'Salvează modificările'}
        </button>
      </form>
    </div>
  );
}
