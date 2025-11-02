'use client';

import { useState } from 'react';
import { useStore, Workout } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Flame, MapPin, Heart, Calendar, Bluetooth } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale/pl';

export default function WorkoutsTab() {
  const workouts = useStore((state) => state.workouts);
  const addWorkout = useStore((state) => state.addWorkout);
  const deleteWorkout = useStore((state) => state.deleteWorkout);
  const isBluetoothConnected = useStore((state) => state.isBluetoothConnected);
  const setBluetoothConnected = useStore((state) => state.setBluetoothConnected);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    caloriesBurned: '',
    distance: '',
    heartRate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addWorkout({
      type: formData.type,
      date: new Date(formData.date),
      duration: Number(formData.duration),
      caloriesBurned: Number(formData.caloriesBurned),
      distance: formData.distance ? Number(formData.distance) : undefined,
      heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
      source: 'manual',
    });

    setFormData({
      type: '',
      date: new Date().toISOString().split('T')[0],
      duration: '',
      caloriesBurned: '',
      distance: '',
      heartRate: '',
    });
    setShowForm(false);
  };

  const connectBluetooth = async () => {
    try {
      // Check if Web Bluetooth API is available
      if (!navigator.bluetooth) {
        alert('Web Bluetooth API nie jest dostępne w tej przeglądarce. Użyj Chrome, Edge lub Opera.');
        return;
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Xiaomi' }, { namePrefix: 'Redmi' }],
        optionalServices: ['heart_rate', 'fitness_machine'],
      });

      console.log('Połączono z urządzeniem:', device.name);
      setBluetoothConnected(true);
      
      // In real implementation, you would:
      // 1. Connect to GATT server
      // 2. Subscribe to characteristic notifications
      // 3. Process incoming data and create workout entries
      
      alert(`Połączono z: ${device.name}\n\nW pełnej implementacji dane treningowe będą automatycznie synchronizowane z zegarka.`);
    } catch (error) {
      console.error('Błąd połączenia Bluetooth:', error);
      alert('Nie udało się połączyć z urządzeniem. Upewnij się, że Bluetooth jest włączony.');
    }
  };

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group workouts by date and calculate daily totals
  const workoutsByDate = sortedWorkouts.reduce((acc, workout) => {
    const dateKey = format(new Date(workout.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(workout);
    return acc;
  }, {} as Record<string, Workout[]>);

  // Calculate total duration for each day
  const getDailyDuration = (dateKey: string) => {
    return workoutsByDate[dateKey].reduce((sum, w) => sum + w.duration, 0);
  };

  const theme = useStore((state) => state.theme);
  const isDark = theme === 'dark';

  return (
    <div className="h-full overflow-y-auto px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-neon-blue neon-text' : 'text-blue-600'}`}>
              Treningi
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Historia i zarządzanie aktywnością fizyczną
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={connectBluetooth}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg border transition-all duration-300 ${
                isBluetoothConnected
                  ? 'border-neon-green text-neon-green bg-neon-green/10'
                  : 'border-neon-blue text-neon-blue hover:bg-neon-blue/10'
              }`}
            >
              <Bluetooth className="w-5 h-5" />
              <span>{isBluetoothConnected ? 'Połączono' : 'Połącz zegarek'}</span>
            </button>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-neon flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Dodaj trening</span>
            </button>
          </div>
        </div>

        {/* Add Workout Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel rounded-xl p-6 mb-6 border border-neon-blue/30"
            >
              <h2 className="text-xl font-semibold text-neon-blue mb-4">Nowy trening</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Rodzaj treningu</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="np. Bieganie, Rower, Siłownia"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Czas trwania (min)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Spalone kalorie</label>
                  <input
                    type="number"
                    value={formData.caloriesBurned}
                    onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                    placeholder="250"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Dystans (km) - opcjonalnie</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    placeholder="5.0"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Tętno śr. - opcjonalnie</label>
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                    placeholder="140"
                  />
                </div>

                <div className="col-span-2 flex justify-end space-x-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Anuluj
                  </button>
                  <button type="submit" className="btn-neon-green">
                    Zapisz trening
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workouts List - Grouped by Date */}
        <div className="space-y-4">
          {sortedWorkouts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`rounded-xl p-12 text-center border ${
                isDark 
                  ? 'glass-panel border-neon-blue/20' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <Calendar className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-neon-blue/30' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Brak treningów do wyświetlenia
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Dodaj swój pierwszy trening lub połącz zegarek Xiaomi
              </p>
            </motion.div>
          ) : (
            Object.entries(workoutsByDate).map(([dateKey, dayWorkouts], groupIndex) => {
              const dailyDuration = getDailyDuration(dateKey);
              const dailyCalories = dayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
              
              return (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                  className="space-y-2"
                >
                  {/* Date Header with Daily Summary */}
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-dark-card border border-neon-blue/20' 
                      : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <Calendar className={`w-4 h-4 ${isDark ? 'text-neon-blue' : 'text-blue-600'}`} />
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {format(new Date(dateKey), 'EEEE, dd MMMM yyyy', { locale: pl })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5">
                        <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-neon-cyan' : 'text-blue-500'}`} />
                        <span className={`text-xs font-semibold ${isDark ? 'text-neon-cyan' : 'text-blue-600'}`}>
                          {dailyDuration} min
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Flame className={`w-3.5 h-3.5 ${isDark ? 'text-neon-blue' : 'text-orange-500'}`} />
                        <span className={`text-xs font-semibold ${isDark ? 'text-neon-blue' : 'text-orange-600'}`}>
                          {dailyCalories} kcal
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        isDark 
                          ? 'bg-neon-blue/20 text-neon-blue' 
                          : 'bg-blue-200 text-blue-700'
                      }`}>
                        {dayWorkouts.length} {dayWorkouts.length === 1 ? 'trening' : 'treningów'}
                      </span>
                    </div>
                  </div>

                  {/* Workouts for this day - Compact layout */}
                  <div className="space-y-1.5 pl-2">
                    {dayWorkouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                        className={`rounded-lg px-3 py-2 border transition-all duration-300 ${
                          isDark
                            ? 'glass-panel border-neon-blue/20 hover:border-neon-blue/50'
                            : 'bg-white border-gray-200 hover:border-blue-300'
                        }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Workout name and badge */}
                    <div className="flex items-center space-x-2 min-w-[180px]">
                              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {workout.type}
                              </h3>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        workout.source === 'xiaomi'
                                  ? isDark ? 'bg-neon-green/20 text-neon-green' : 'bg-green-100 text-green-700'
                                  : isDark ? 'bg-neon-blue/20 text-neon-blue' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {workout.source === 'xiaomi' ? 'Xiaomi' : 'Ręczne'}
                      </span>
                    </div>

                    {/* Stats in a single line */}
                    <div className="flex items-center space-x-4 flex-1">
                              <div className={`flex items-center space-x-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">{workout.duration} min</span>
                      </div>

                              <div className={`flex items-center space-x-1.5 ${isDark ? 'text-neon-blue' : 'text-orange-600'}`}>
                        <Flame className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">{workout.caloriesBurned} kcal</span>
                      </div>

                      {workout.distance && (
                                <div className={`flex items-center space-x-1.5 ${isDark ? 'text-neon-cyan' : 'text-cyan-600'}`}>
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">{workout.distance} km</span>
                        </div>
                      )}

                      {workout.heartRate && (
                                <div className={`flex items-center space-x-1.5 ${isDark ? 'text-neon-green' : 'text-green-600'}`}>
                          <Heart className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">{workout.heartRate} bpm</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteWorkout(workout.id)}
                            className={`transition-colors p-1.5 rounded hover:bg-red-500/10 ${
                              isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'
                            }`}
                    title="Usuń trening"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        {workouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            <div className="glass-panel rounded-xl p-4 border border-neon-blue/30 text-center">
              <p className="text-gray-400 text-sm mb-1">Łącznie treningów</p>
              <p className="text-3xl font-bold text-neon-blue">{workouts.length}</p>
            </div>
            
            <div className="glass-panel rounded-xl p-4 border border-neon-blue/30 text-center">
              <p className="text-gray-400 text-sm mb-1">Spalone kalorie</p>
              <p className="text-3xl font-bold text-neon-cyan">
                {workouts.reduce((sum, w) => sum + w.caloriesBurned, 0).toFixed(0)}
              </p>
            </div>
            
            <div className="glass-panel rounded-xl p-4 border border-neon-blue/30 text-center">
              <p className="text-gray-400 text-sm mb-1">Łączny dystans</p>
              <p className="text-3xl font-bold text-neon-green">
                {workouts.reduce((sum, w) => sum + (w.distance || 0), 0).toFixed(1)} km
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

