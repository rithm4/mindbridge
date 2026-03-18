import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * Hook reutilizabil pentru gestionarea programărilor.
 * Folosit în DashboardPage, AppointmentsPage, CalendarPage.
 */
export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    api.get('/appointments')
      .then(({ data }) => {
        setAppointments(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Eroare la încărcare.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = useCallback(async (id, status, cancellationReason = '') => {
    const { data } = await api.patch(`/appointments/${id}/status`, {
      status,
      ...(cancellationReason ? { cancellationReason } : {}),
    });
    setAppointments((prev) => prev.map((a) => (a._id === id ? data : a)));
    return data;
  }, []);

  return { appointments, loading, error, refetch: fetch, updateStatus };
};
