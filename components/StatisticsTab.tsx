'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Calendar, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { format, subDays, subMonths, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { pl } from 'date-fns/locale/pl';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeRange = '7days' | '30days' | '90days';

export default function StatisticsTab() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const workouts = useStore((state) => state.workouts);
  const userProfile = useStore((state) => state.userProfile);
  const dailyStats = useStore((state) => state.dailyStats);
  const getLatestWeight = useStore((state) => state.getLatestWeight);

  const getDaysInRange = (range: TimeRange) => {
    switch (range) {
      case '7days':
        return 7;
      case '30days':
        return 30;
      case '90days':
        return 90;
    }
  };

  const getFilteredWorkouts = () => {
    const days = getDaysInRange(timeRange);
    const cutoffDate = subDays(new Date(), days);
    return workouts.filter((w) => new Date(w.date) >= cutoffDate);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const filteredWorkouts = getFilteredWorkouts();
    const latestWeight = getLatestWeight();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 243, 255);
    doc.text('NeoFit Monitor - Raport', 20, 20);

    // User info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Data wygenerowania: ${format(new Date(), 'dd MMMM yyyy', { locale: pl })}`, 20, 30);
    doc.text(`Okres: ${timeRange === '7days' ? '7 dni' : timeRange === '30days' ? '30 dni' : '90 dni'}`, 20, 37);

    // Profile summary
    doc.setFontSize(14);
    doc.text('Profil użytkownika', 20, 50);
    doc.setFontSize(10);
    doc.text(`Waga: ${latestWeight.toFixed(1)} kg | Cel: ${userProfile.targetWeight} kg`, 20, 57);
    doc.text(`Wzrost: ${userProfile.height} cm | Tłuszcz: ${userProfile.bodyFat}%`, 20, 64);

    // Workouts table
    const tableData = filteredWorkouts.map((w) => [
      format(new Date(w.date), 'dd.MM.yyyy'),
      w.type,
      `${w.duration} min`,
      `${w.caloriesBurned} kcal`,
      w.distance ? `${w.distance} km` : '-',
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Data', 'Typ', 'Czas', 'Kalorie', 'Dystans']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 243, 255] },
    });

    doc.save(`neofit-raport-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Prepare chart data
  const filteredWorkouts = getFilteredWorkouts();
  
  // Group workouts by date and sum values
  const workoutsByDate = filteredWorkouts.reduce((acc, w) => {
    const dateKey = format(new Date(w.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: new Date(w.date),
        duration: 0,
        caloriesBurned: 0,
        distance: 0,
      };
    }
    acc[dateKey].duration += w.duration;
    acc[dateKey].caloriesBurned += w.caloriesBurned;
    acc[dateKey].distance += w.distance || 0;
    return acc;
  }, {} as Record<string, { date: Date; duration: number; caloriesBurned: number; distance: number }>);

  // Convert to sorted array
  const groupedWorkouts = Object.values(workoutsByDate).sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Calories burned over time
  const caloriesChartData = {
    labels: groupedWorkouts.map((w) => format(w.date, 'dd MMM', { locale: pl })),
    datasets: [
      {
        label: 'Spalone kalorie',
        data: groupedWorkouts.map((w) => w.caloriesBurned),
        borderColor: '#00f3ff',
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Workout types distribution
  const workoutTypes = filteredWorkouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const workoutTypesChartData = {
    labels: Object.keys(workoutTypes),
    datasets: [
      {
        data: Object.values(workoutTypes),
        backgroundColor: [
          'rgba(0, 243, 255, 0.7)',
          'rgba(0, 255, 136, 0.7)',
          'rgba(0, 255, 255, 0.7)',
          'rgba(180, 0, 255, 0.7)',
          'rgba(255, 0, 255, 0.7)',
        ],
        borderColor: [
          '#00f3ff',
          '#00ff88',
          '#00ffff',
          '#b400ff',
          '#ff00ff',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Duration by workout - grouped by date
  const durationChartData = {
    labels: groupedWorkouts.map((w) => format(w.date, 'dd MMM', { locale: pl })),
    datasets: [
      {
        label: 'Czas treningu (min)',
        data: groupedWorkouts.map((w) => w.duration),
        backgroundColor: 'rgba(0, 255, 136, 0.7)',
        borderColor: '#00ff88',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 14, 23, 0.9)',
        titleColor: '#00f3ff',
        bodyColor: '#ffffff',
        borderColor: '#00f3ff',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(0, 243, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(0, 243, 255, 0.1)' },
      },
    },
  };

  // Calculate statistics
  const totalCalories = filteredWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const totalDistance = filteredWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);
  const avgDuration = filteredWorkouts.length > 0
    ? filteredWorkouts.reduce((sum, w) => sum + w.duration, 0) / filteredWorkouts.length
    : 0;

  // Calculate trend
  const halfLength = Math.floor(filteredWorkouts.length / 2);
  const firstHalf = filteredWorkouts.slice(0, halfLength);
  const secondHalf = filteredWorkouts.slice(halfLength);
  
  const firstHalfAvg = firstHalf.length > 0
    ? firstHalf.reduce((sum, w) => sum + w.caloriesBurned, 0) / firstHalf.length
    : 0;
  const secondHalfAvg = secondHalf.length > 0
    ? secondHalf.reduce((sum, w) => sum + w.caloriesBurned, 0) / secondHalf.length
    : 0;
  
  const trend = secondHalfAvg > firstHalfAvg ? 'up' : secondHalfAvg < firstHalfAvg ? 'down' : 'stable';

  return (
    <div className="h-full overflow-y-auto px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neon-blue neon-text mb-2">Statystyki</h1>
            <p className="text-gray-400">Analiza postępów i wizualizacja danych</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time range selector */}
            <div className="flex items-center space-x-2 glass-panel rounded-lg p-1 border border-neon-blue/30">
              {(['7days', '30days', '90days'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded transition-all duration-300 ${
                    timeRange === range
                      ? 'bg-neon-blue text-dark-bg font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {range === '7days' ? '7 dni' : range === '30days' ? '30 dni' : '90 dni'}
                </button>
              ))}
            </div>

            <button onClick={exportToPDF} className="btn-neon-green flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Eksportuj PDF</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <p className="text-gray-400 text-sm mb-2">Łączne kalorie</p>
            <p className="text-3xl font-bold text-neon-blue">{totalCalories.toFixed(0)}</p>
            <p className="text-gray-500 text-xs mt-1">kcal</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <p className="text-gray-400 text-sm mb-2">Łączny dystans</p>
            <p className="text-3xl font-bold text-neon-cyan">{totalDistance.toFixed(1)}</p>
            <p className="text-gray-500 text-xs mt-1">km</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <p className="text-gray-400 text-sm mb-2">Średni czas treningu</p>
            <p className="text-3xl font-bold text-neon-green">{avgDuration.toFixed(0)}</p>
            <p className="text-gray-500 text-xs mt-1">min</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="stat-card"
          >
            <p className="text-gray-400 text-sm mb-2">Trend</p>
            <div className="flex items-center space-x-2">
              {trend === 'up' && (
                <>
                  <TrendingUp className="w-8 h-8 text-neon-green" />
                  <span className="text-2xl font-bold text-neon-green">Wzrost</span>
                </>
              )}
              {trend === 'down' && (
                <>
                  <TrendingDown className="w-8 h-8 text-red-400" />
                  <span className="text-2xl font-bold text-red-400">Spadek</span>
                </>
              )}
              {trend === 'stable' && (
                <>
                  <Minus className="w-8 h-8 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-400">Stabilny</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        {filteredWorkouts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Calories Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-panel rounded-xl p-6 border border-neon-blue/30"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Spalone kalorie w czasie</h3>
                <div className="h-64">
                  <Line data={caloriesChartData} options={chartOptions} />
                </div>
              </motion.div>

              {/* Workout Types Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="glass-panel rounded-xl p-6 border border-neon-blue/30"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Rodzaje treningów</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={workoutTypesChartData}
                    options={{
                      ...chartOptions,
                      scales: undefined,
                    }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Duration Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="glass-panel rounded-xl p-6 border border-neon-blue/30"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Długość treningów</h3>
              <div className="h-64">
                <Bar data={durationChartData} options={chartOptions} />
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel rounded-xl p-12 text-center border border-neon-blue/20"
          >
            <Calendar className="w-16 h-16 text-neon-blue/30 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Brak danych do wyświetlenia</p>
            <p className="text-gray-500 text-sm mt-2">
              Dodaj treningi, aby zobaczyć statystyki i wykresy
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

