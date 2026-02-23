import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaCalendarDay, FaCalendarWeek } from 'react-icons/fa';

interface RecurrenceConfigProps {
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | null;
  recurrenceTimes?: string[] | null;
  recurrenceDays?: number[] | null;
  onChange: (config: {
    isRecurring: boolean;
    recurrenceType?: 'daily' | 'weekly' | 'monthly' | null;
    recurrenceTimes?: string[] | null;
    recurrenceDays?: number[] | null;
  }) => void;
}

const RecurrenceConfig: React.FC<RecurrenceConfigProps> = ({
  recurrenceType: initialRecurrenceType,
  recurrenceTimes: initialRecurrenceTimes,
  recurrenceDays: initialRecurrenceDays,
  onChange
}) => {
  const [isRecurring, setIsRecurring] = useState(!!initialRecurrenceType);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | null>(initialRecurrenceType || null);
  const [recurrenceTimes, setRecurrenceTimes] = useState<string[]>(initialRecurrenceTimes || ['09:00']);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(initialRecurrenceDays || [1, 2, 3, 4, 5]); // Monday-Friday by default
  
  const weekDays = [
    { id: 0, label: 'Dom', name: 'Domingo' },
    { id: 1, label: 'Seg', name: 'Segunda' },
    { id: 2, label: 'Ter', name: 'Terça' },
    { id: 3, label: 'Qua', name: 'Quarta' },
    { id: 4, label: 'Qui', name: 'Quinta' },
    { id: 5, label: 'Sex', name: 'Sexta' },
    { id: 6, label: 'Sáb', name: 'Sábado' }
  ];

  const timeOptions = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  // Notify parent when configuration changes
  useEffect(() => {
    onChange({
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : null,
      recurrenceTimes: isRecurring && recurrenceType ? recurrenceTimes : null,
      recurrenceDays: isRecurring && recurrenceType === 'weekly' ? recurrenceDays : null
    });
  }, [isRecurring, recurrenceType, recurrenceTimes, recurrenceDays]);

  const handleAddTime = () => {
    setRecurrenceTimes([...recurrenceTimes, '09:00']);
  };

  const handleRemoveTime = (index: number) => {
    if (recurrenceTimes.length > 1) {
      const newTimes = [...recurrenceTimes];
      newTimes.splice(index, 1);
      setRecurrenceTimes(newTimes);
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...recurrenceTimes];
    newTimes[index] = value;
    setRecurrenceTimes(newTimes);
  };

  const handleDayToggle = (dayId: number) => {
    if (recurrenceDays.includes(dayId)) {
      setRecurrenceDays(recurrenceDays.filter(id => id !== dayId));
    } else {
      setRecurrenceDays([...recurrenceDays, dayId].sort((a, b) => a - b));
    }
  };

  const handleSelectAllDays = () => {
    setRecurrenceDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleClearDays = () => {
    setRecurrenceDays([]);
  };

  const handleSelectWeekdays = () => {
    setRecurrenceDays([1, 2, 3, 4, 5]); // Monday to Friday
  };

  return (
    <div className="recurrence-config">
      <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">Tarefa Recorrente</span>
          <FaCalendarAlt className="text-gray-500" />
        </label>
        <p className="text-sm text-gray-600 ml-6 mt-1">
          Configure se esta tarefa deve se repetir automaticamente
        </p>
      </div>

      {isRecurring && (
        <div className="ml-6 space-y-4">
          {/* Recurrence Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Recorrência
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRecurrenceType('daily')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                  recurrenceType === 'daily'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaCalendarDay className="text-lg mb-1" />
                <span className="text-sm font-medium">Diária</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRecurrenceType('weekly')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                  recurrenceType === 'weekly'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaCalendarWeek className="text-lg mb-1" />
                <span className="text-sm font-medium">Semanal</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRecurrenceType('monthly')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                  recurrenceType === 'monthly'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaCalendarAlt className="text-lg mb-1" />
                <span className="text-sm font-medium">Mensal</span>
              </button>
            </div>
          </div>

          {/* Time Selection */}
          {recurrenceType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaClock className="inline mr-2" />
                Horários
              </label>
              <div className="space-y-2">
                {recurrenceTimes.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timeOptions.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {recurrenceTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Adicionar outro horário
                </button>
              </div>
            </div>
          )}

          {/* Day Selection (Weekly only) */}
          {recurrenceType === 'weekly' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dias da Semana
                </label>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectWeekdays}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Dias úteis
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllDays}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDays}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleDayToggle(day.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border ${
                      recurrenceDays.includes(day.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                    title={day.name}
                  >
                    <span className="text-sm font-medium">{day.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selecionados: {recurrenceDays.length} dia(s)
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Resumo da Recorrência</h4>
            {recurrenceType === 'daily' && (
              <p className="text-sm text-gray-600">
                Repete diariamente às {recurrenceTimes.join(', ')}
              </p>
            )}
            {recurrenceType === 'weekly' && recurrenceDays.length > 0 && (
              <p className="text-sm text-gray-600">
                Repete semanalmente nas {recurrenceDays.map(d => weekDays.find(w => w.id === d)?.label).join(', ')} às {recurrenceTimes.join(', ')}
              </p>
            )}
            {recurrenceType === 'monthly' && (
              <p className="text-sm text-gray-600">
                Repete mensalmente às {recurrenceTimes.join(', ')}
              </p>
            )}
            {recurrenceType === 'weekly' && recurrenceDays.length === 0 && (
              <p className="text-sm text-yellow-600">
                Selecione pelo menos um dia da semana
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurrenceConfig;