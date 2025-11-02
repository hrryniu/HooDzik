'use client';

import { useState, useMemo } from 'react';
import { useStore, Gender, BodyType, WeightEntry } from '@/store/useStore';
import { motion } from 'framer-motion';
import { User, Ruler, Weight, Target, Droplet, Calendar, Save, RotateCcw, Sun, Moon, Activity, TrendingUp, Plus, Trash2, History } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ProfileTab() {
  const userProfile = useStore((state) => state.userProfile);
  const setUserProfile = useStore((state) => state.setUserProfile);
  const getBMI = useStore((state) => state.getBMI);
  const getBodyFatPercentage = useStore((state) => state.getBodyFatPercentage);
  const getBMR = useStore((state) => state.getBMR);
  const getTDEE = useStore((state) => state.getTDEE);
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  
  const weightEntries = useStore((state) => state.weightEntries);
  const addWeightEntry = useStore((state) => state.addWeightEntry);
  const deleteWeightEntry = useStore((state) => state.deleteWeightEntry);
  const getLatestWeight = useStore((state) => state.getLatestWeight);

  const [formData, setFormData] = useState(userProfile);
  const [hasChanges, setHasChanges] = useState(false);
  
  const latestWeight = getLatestWeight();
  
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWeightValue, setNewWeightValue] = useState('');
  const [newWeightNote, setNewWeightNote] = useState('');

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    setUserProfile(formData);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData(userProfile);
    setHasChanges(false);
  };

  const handleAddWeightEntry = () => {
    if (!newWeightValue || parseFloat(newWeightValue) <= 0) return;
    
    addWeightEntry({
      date: newWeightDate,
      weight: parseFloat(newWeightValue),
      note: newWeightNote || undefined,
    });
    
    setNewWeightValue('');
    setNewWeightNote('');
    setNewWeightDate(new Date().toISOString().split('T')[0]);
  };

  const bmi = getBMI();
  const getBMICategory = () => {
    if (bmi < 18.5) return { label: 'Niedowaga', color: 'text-yellow-400' };
    if (bmi < 25) return { label: 'Prawidłowa waga', color: 'text-neon-green' };
    if (bmi < 30) return { label: 'Nadwaga', color: 'text-yellow-400' };
    return { label: 'Otyłość', color: 'text-red-400' };
  };

  const bmiCategory = getBMICategory();
  const isDark = theme === 'dark';

  // Prepare chart data
  const weightChartData = useMemo(() => {
    const sortedEntries = [...weightEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedEntries.map(entry => {
        const date = new Date(entry.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          label: 'Waga (kg)',
          data: sortedEntries.map(entry => entry.weight),
          borderColor: isDark ? '#00f0ff' : '#3b82f6',
          backgroundColor: isDark ? 'rgba(0, 240, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: isDark ? '#00f0ff' : '#3b82f6',
        },
        {
          label: 'Cel wagowy',
          data: sortedEntries.map(() => formData.targetWeight),
          borderColor: isDark ? '#00ff88' : '#10b981',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0,
        },
      ],
    };
  }, [weightEntries, formData.targetWeight, isDark]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: isDark ? '#ffffff' : '#000000',
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#ffffff' : '#000000',
        bodyColor: isDark ? '#ffffff' : '#000000',
        borderColor: isDark ? '#00f0ff' : '#3b82f6',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#ffffff' : '#000000',
        },
      },
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#ffffff' : '#000000',
        },
      },
    },
  };

  const genderOptions: { value: Gender; label: string }[] = [
    { value: 'male', label: 'Mężczyzna' },
    { value: 'female', label: 'Kobieta' },
  ];

  const bodyTypeOptions: { value: BodyType; label: string; description: string }[] = [
    { value: 'ectomorph', label: 'Ektomorfik', description: 'Szczupła budowa, trudności w budowaniu masy' },
    { value: 'mesomorph', label: 'Mezomorfik', description: 'Atletyczna budowa, łatwo buduje mięśnie' },
    { value: 'endomorph', label: 'Endomorfik', description: 'Masywna budowa, łatwo przytyje' },
  ];

  return (
    <div className="h-full overflow-y-auto px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-neon-blue neon-text' : 'text-blue-600'}`}>Profil użytkownika</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Zarządzaj swoimi danymi i celami treningowymi</p>
          </div>

          <div className="flex space-x-4">
            {hasChanges && (
              <>
                <button onClick={handleReset} className="btn-neon flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5" />
                  <span>Anuluj</span>
                </button>
                <button onClick={handleSave} className="btn-neon-green flex items-center space-x-2">
                  <Save className="w-5 h-5" />
                  <span>Zapisz zmiany</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Theme Switcher */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-6 rounded-xl border ${
            isDark 
              ? 'glass-panel border-neon-blue/30' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Motyw aplikacji
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Wybierz preferowany styl kolorów
              </p>
            </div>

            <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-neon-blue/30' : 'border-gray-300'}`}>
              <button
                onClick={() => setTheme('dark')}
                className={`px-6 py-3 flex items-center gap-2 transition-all ${
                  theme === 'dark'
                    ? isDark ? 'bg-neon-blue text-white' : 'bg-blue-600 text-white'
                    : isDark ? 'bg-dark-card text-gray-400 hover:text-white' : 'bg-gray-50 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="font-medium">Ciemny</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-6 py-3 flex items-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-blue-600 text-white'
                    : isDark ? 'bg-dark-card text-gray-400 hover:text-white' : 'bg-gray-50 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="font-medium">Jasny</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Profile Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Gender Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-xl p-6 border border-neon-blue/30"
            >
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-neon-blue" />
                <h3 className="text-lg font-semibold text-white">Płeć</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {genderOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange('gender', option.value)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      formData.gender === option.value
                        ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Age */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-xl p-6 border border-neon-blue/30"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-neon-blue" />
                <h3 className="text-lg font-semibold text-white">Wiek</h3>
              </div>
              
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', Number(e.target.value))}
                min="1"
                max="120"
                className="w-full"
              />
            </motion.div>

            {/* Height */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-xl p-6 border border-neon-blue/30"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Ruler className="w-5 h-5 text-neon-cyan" />
                <h3 className="text-lg font-semibold text-white">Wzrost</h3>
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange('height', Number(e.target.value))}
                  min="100"
                  max="250"
                  className="w-full"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  cm
                </span>
              </div>
            </motion.div>

            {/* Weight */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-xl p-6 border ${
                isDark 
                  ? 'glass-panel border-neon-blue/30' 
                  : 'bg-white border-blue-200'
              }`}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Weight className={`w-5 h-5 ${isDark ? 'text-neon-blue' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Aktualna waga</h3>
              </div>
              
              <div className={`text-center py-4 rounded-lg ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-neon-blue' : 'text-blue-600'}`}>
                  {latestWeight.toFixed(1)} <span className="text-2xl">kg</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {weightEntries.length > 0 
                    ? `Ostatni pomiar: ${new Date(weightEntries[0].date).toLocaleDateString('pl-PL')}`
                    : 'Brak pomiarów w historii'
                  }
                </p>
              </div>
              
              <p className={`text-xs text-center mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Aktualizuj wagę w sekcji "Historia Wagi" poniżej
              </p>
            </motion.div>
          </div>

          {/* Right Column - Goals & Body Type */}
          <div className="space-y-6">
            {/* Target Weight */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-xl p-6 border border-neon-green/30"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-neon-green" />
                <h3 className="text-lg font-semibold text-white">Docelowa waga</h3>
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  value={formData.targetWeight}
                  onChange={(e) => handleChange('targetWeight', Number(e.target.value))}
                  min="30"
                  max="300"
                  step="0.1"
                  className="w-full"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  kg
                </span>
              </div>

              <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Różnica:</span>
                  <span className={`font-semibold ${
                    latestWeight > formData.targetWeight 
                      ? isDark ? 'text-neon-green' : 'text-green-600'
                      : isDark ? 'text-neon-blue' : 'text-blue-600'
                  }`}>
                    {Math.abs(latestWeight - formData.targetWeight).toFixed(1)} kg
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Body Fat */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-xl p-6 border border-neon-cyan/30"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Droplet className="w-5 h-5 text-neon-cyan" />
                <h3 className="text-lg font-semibold text-white">Tłuszcz w ciele</h3>
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  value={formData.bodyFat}
                  onChange={(e) => handleChange('bodyFat', Number(e.target.value))}
                  min="3"
                  max="50"
                  step="0.1"
                  className="w-full"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  %
                </span>
              </div>
            </motion.div>

            {/* Body Type */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-xl p-6 border border-neon-blue/30"
            >
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-neon-blue" />
                <h3 className="text-lg font-semibold text-white">Typ budowy ciała</h3>
              </div>
              
              <div className="space-y-3">
                {bodyTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange('bodyType', option.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      formData.bodyType === option.value
                        ? 'border-neon-blue bg-neon-blue/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className={`font-semibold mb-1 ${
                      formData.bodyType === option.value ? 'text-neon-blue' : 'text-white'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-400">{option.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* BMI Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-xl p-6 border ${
                isDark 
                  ? 'glass-panel border-neon-green/30' 
                  : 'bg-white border-green-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Wskaźnik BMI
              </h3>
              
              <div className="flex items-end space-x-3 mb-3">
                <span className={`text-4xl font-bold ${isDark ? 'text-neon-green' : 'text-green-600'}`}>
                  {bmi.toFixed(1)}
                </span>
                <span className={`text-lg font-medium pb-1 ${bmiCategory.color}`}>
                  {bmiCategory.label}
                </span>
              </div>

              <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex justify-between">
                  <span>Niedowaga:</span>
                  <span>&lt; 18.5</span>
                </div>
                <div className="flex justify-between">
                  <span>Norma:</span>
                  <span>18.5 - 24.9</span>
                </div>
                <div className="flex justify-between">
                  <span>Nadwaga:</span>
                  <span>25.0 - 29.9</span>
                </div>
                <div className="flex justify-between">
                  <span>Otyłość:</span>
                  <span>≥ 30.0</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Advanced Calculations - BMR, TDEE, Body Fat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Zaawansowane Wyliczenia
          </h2>

          <div className="grid grid-cols-3 gap-6">
            {/* Body Fat Percentage */}
            <div className={`rounded-xl p-6 border ${
              isDark 
                ? 'glass-panel border-neon-cyan/30' 
                : 'bg-white border-blue-200'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <Droplet className={`w-5 h-5 ${isDark ? 'text-neon-cyan' : 'text-blue-500'}`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Tłuszcz w ciele
                </h3>
              </div>
              
              <div className="flex items-end space-x-3 mb-3">
                <span className={`text-4xl font-bold ${isDark ? 'text-neon-cyan' : 'text-blue-600'}`}>
                  {getBodyFatPercentage().toFixed(1)}
                </span>
                <span className={`text-xl ${isDark ? 'text-neon-cyan/70' : 'text-blue-600/70'} pb-1`}>
                  %
                </span>
              </div>

              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Szacunkowa wartość na podstawie BMI i wieku (wzór Deurenberga)
              </p>
            </div>

            {/* BMR */}
            <div className={`rounded-xl p-6 border ${
              isDark 
                ? 'glass-panel border-neon-blue/30' 
                : 'bg-white border-blue-200'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className={`w-5 h-5 ${isDark ? 'text-neon-blue' : 'text-blue-500'}`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  BMR
                </h3>
              </div>
              
              <div className="flex items-end space-x-3 mb-3">
                <span className={`text-4xl font-bold ${isDark ? 'text-neon-blue' : 'text-blue-600'}`}>
                  {Math.round(getBMR())}
                </span>
                <span className={`text-sm ${isDark ? 'text-neon-blue/70' : 'text-blue-600/70'} pb-1`}>
                  kcal/dzień
                </span>
              </div>

              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Podstawowa przemiana materii (Mifflin-St Jeor)
              </p>
            </div>

            {/* TDEE Calculator */}
            <div className={`rounded-xl p-6 border ${
              isDark 
                ? 'glass-panel border-neon-green/30' 
                : 'bg-white border-green-200'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className={`w-5 h-5 ${isDark ? 'text-neon-green' : 'text-green-600'}`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  TDEE
                </h3>
              </div>
              
              <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex justify-between">
                  <span>Siedzący:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(getTDEE('sedentary'))} kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lekka aktywność:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(getTDEE('light'))} kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Umiarkowana:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(getTDEE('moderate'))} kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Wysoka:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(getTDEE('active'))} kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bardzo wysoka:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(getTDEE('very_active'))} kcal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weight Tracking Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <History className={`w-6 h-6 ${isDark ? 'text-neon-blue' : 'text-blue-600'}`} />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Historia Wagi
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Weight Entry */}
            <div className={`rounded-xl p-6 border ${
              isDark 
                ? 'glass-panel border-neon-blue/30' 
                : 'bg-white border-blue-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Plus className="w-5 h-5" />
                <span>Dodaj Pomiar</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Data
                  </label>
                  <input
                    type="date"
                    value={newWeightDate}
                    onChange={(e) => setNewWeightDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Waga (kg)
                  </label>
                  <input
                    type="number"
                    value={newWeightValue}
                    onChange={(e) => setNewWeightValue(e.target.value)}
                    placeholder="np. 75.5"
                    min="30"
                    max="300"
                    step="0.1"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notatka (opcjonalnie)
                  </label>
                  <input
                    type="text"
                    value={newWeightNote}
                    onChange={(e) => setNewWeightNote(e.target.value)}
                    placeholder="np. Po treningu, przed śniadaniem..."
                    className="w-full"
                  />
                </div>
                
                <button
                  onClick={handleAddWeightEntry}
                  disabled={!newWeightValue || parseFloat(newWeightValue) <= 0}
                  className={`w-full btn-neon-green flex items-center justify-center space-x-2 ${
                    (!newWeightValue || parseFloat(newWeightValue) <= 0) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span>Dodaj Pomiar</span>
                </button>
              </div>
            </div>

            {/* Weight History List */}
            <div className={`rounded-xl p-6 border ${
              isDark 
                ? 'glass-panel border-neon-cyan/30' 
                : 'bg-white border-blue-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ostatnie Pomiary
              </h3>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {weightEntries.length === 0 ? (
                  <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Brak pomiarów. Dodaj swój pierwszy pomiar!
                  </p>
                ) : (
                  weightEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        isDark 
                          ? 'border-gray-600 bg-dark-card/50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className={`font-semibold text-lg ${isDark ? 'text-neon-cyan' : 'text-blue-600'}`}>
                            {entry.weight} kg
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(entry.date).toLocaleDateString('pl-PL', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        {entry.note && (
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {entry.note}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteWeightEntry(entry.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark 
                            ? 'hover:bg-red-500/20 text-red-400' 
                            : 'hover:bg-red-100 text-red-600'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Weight Chart */}
          {weightEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`mt-6 rounded-xl p-6 border ${
                isDark 
                  ? 'glass-panel border-neon-blue/30' 
                  : 'bg-white border-blue-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Wykres Postępów
              </h3>
              
              <div className="h-[300px]">
                <Line data={weightChartData} options={chartOptions} />
              </div>
              
              {weightEntries.length >= 2 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pierwszy pomiar</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weightEntries[weightEntries.length - 1].weight} kg
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ostatni pomiar</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weightEntries[0].weight} kg
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Zmiana</p>
                    <p className={`text-lg font-semibold ${
                      (weightEntries[0].weight - weightEntries[weightEntries.length - 1].weight) < 0 
                        ? isDark ? 'text-neon-green' : 'text-green-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {(weightEntries[0].weight - weightEntries[weightEntries.length - 1].weight) > 0 ? '+' : ''}
                      {(weightEntries[0].weight - weightEntries[weightEntries.length - 1].weight).toFixed(1)} kg
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Info Banner */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 glass-panel rounded-xl p-4 border border-yellow-500/50 bg-yellow-500/10"
          >
            <p className="text-yellow-400 text-center">
              Masz niezapisane zmiany. Kliknij "Zapisz zmiany", aby zaktualizować profil i model 3D.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}


