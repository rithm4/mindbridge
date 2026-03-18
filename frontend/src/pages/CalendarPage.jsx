import { useEffect, useState } from 'react';
import {
  startOfWeek, endOfWeek, eachDayOfInterval,
  format, addWeeks, subWeeks, isSameDay, isToday,
  parseISO, isBefore
} from 'date-fns';
import { ro } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_COLOR = {
  pending:   'bg-yellow-100 border-yellow-300 text-yellow-800',
  confirmed: 'bg-green-100 border-green-300 text-green-800',
  cancelled: 'bg-red-50 border-red-200 text-red-400 line-through',
  completed: 'bg-gray-100 border-gray-200 text-gray-500',
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then(({ data }) => setAppointments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getAppointmentsForDay = (day) =>
    appointments.filter((a) => isSameDay(parseISO(a.startTime), day));

  const isPsychologist = user?.role === 'psychologist';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl text-gray-900">Calendar</h2>
          <p className="text-gray-500 text-sm mt-1">
            {format(weekStart, 'd MMM', { locale: ro })} — {format(weekEnd, 'd MMM yyyy', { locale: ro })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="btn-ghost"
          >
            ← Săpt. ant.
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="btn-secondary text-sm px-3 py-2"
          >
            Azi
          </button>
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="btn-ghost"
          >
            Săpt. urm. →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs flex-wrap">
        {Object.entries(STATUS_COLOR).map(([status, cls]) => (
          <span key={status} className={`badge border ${cls} capitalize`}>
            {{ pending: 'În așteptare', confirmed: 'Confirmată', cancelled: 'Anulată', completed: 'Finalizată' }[status]}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayApts = getAppointmentsForDay(day);
          const isPast = isBefore(day, new Date()) && !isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`rounded-2xl border min-h-[160px] p-3 flex flex-col ${
                isToday(day)
                  ? 'border-primary-400 bg-primary-50'
                  : isPast
                  ? 'border-gray-100 bg-gray-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Day header */}
              <div className="mb-2 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {format(day, 'EEE', { locale: ro })}
                </p>
                <p className={`text-lg font-semibold leading-none mt-0.5 ${
                  isToday(day) ? 'text-primary-700' : 'text-gray-800'
                }`}>
                  {format(day, 'd')}
                </p>
              </div>

              {/* Appointments */}
              <div className="flex-1 space-y-1.5 overflow-y-auto">
                {loading ? (
                  <div className="h-2 bg-gray-200 rounded animate-pulse" />
                ) : dayApts.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center mt-2">—</p>
                ) : (
                  dayApts.map((apt) => {
                    const other = isPsychologist ? apt.patient : apt.psychologist;
                    return (
                      <CalendarEvent
                        key={apt._id}
                        apt={apt}
                        other={other}
                        isPsychologist={isPsychologist}
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: list view for current week */}
      <div className="mt-8">
        <h3 className="font-display text-xl text-gray-900 mb-4">Detalii săptămână</h3>
        <div className="space-y-3">
          {days.map((day) => {
            const dayApts = getAppointmentsForDay(day);
            if (dayApts.length === 0) return null;
            return (
              <div key={day.toISOString()} className="card">
                <p className="font-medium text-gray-900 mb-3 capitalize">
                  {format(day, 'EEEE, d MMMM', { locale: ro })}
                  {isToday(day) && <span className="ml-2 badge bg-primary-100 text-primary-700">Azi</span>}
                </p>
                <div className="space-y-2">
                  {dayApts.map((apt) => {
                    const other = isPsychologist ? apt.patient : apt.psychologist;
                    return (
                      <div key={apt._id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-mono text-xs w-10">
                            {format(parseISO(apt.startTime), 'HH:mm')}
                          </span>
                          <span className="text-gray-700">
                            {other?.firstName} {other?.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge border ${STATUS_COLOR[apt.status]}`}>
                            {{ pending: 'Așteptare', confirmed: 'Confirmată', cancelled: 'Anulată', completed: 'Finalizată' }[apt.status]}
                          </span>
                          {apt.status === 'confirmed' && (
                            <Link
                              to={`/call/${apt.videoRoomId}`}
                              className="text-xs text-primary-600 hover:underline font-medium"
                            >
                              📹 Intră
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CalendarEvent({ apt, other, isPsychologist }) {
  return (
    <div className={`rounded-lg border px-2 py-1 text-xs ${STATUS_COLOR[apt.status]}`}>
      <p className="font-medium truncate">
        {format(parseISO(apt.startTime), 'HH:mm')} {other?.firstName}
      </p>
      {apt.status === 'confirmed' && (
        <Link
          to={`/call/${apt.videoRoomId}`}
          className="underline text-xs opacity-75 hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          📹 intră
        </Link>
      )}
    </div>
  );
}
