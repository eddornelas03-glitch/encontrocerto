import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface MeetingSchedulerProps {
  match: UserProfile;
  onClose: () => void;
  onSchedule: (date: string, time: string) => void;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  match,
  onClose,
  onSchedule,
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time) {
      const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(
        'pt-BR',
        { day: '2-digit', month: '2-digit', year: 'numeric' },
      );
      onSchedule(formattedDate, time);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Agendar Encontro
        </h2>
        <p className="text-gray-500 text-center mt-1">
          Proponha um dia e horário para encontrar {match.name}.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="date"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Data
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="time"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Horário
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-full hover:bg-pink-600 transition-colors"
            >
              Enviar Proposta
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-gray-600 font-bold py-3 px-4 rounded-full hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
