'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingDown, Droplet, Activity, Flame, MapPin, Calendar, Plus, X } from 'lucide-react';

interface StatsPanelProps {
  side: 'left' | 'right';
}

interface StatItemProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  unit?: string;
  color?: 'blue' | 'green' | 'cyan';
  delay?: number;
  onAction?: () => void;
  actionIcon?: React.ComponentType<any>;
}

function StatItem({ icon: Icon, label, value, unit, color = 'blue', delay = 0, onAction, actionIcon: ActionIcon }: StatItemProps) {
  const colorClasses = {
    blue: 'border-neon-blue/30 hover:border-neon-blue',
    green: 'border-neon-green/30 hover:border-neon-green',
    cyan: 'border-neon-cyan/30 hover:border-neon-cyan',
  };

  const iconColorClasses = {
    blue: 'text-neon-blue',
    green: 'text-neon-green',
    cyan: 'text-neon-cyan',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: delay % 2 === 0 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className={`stat-card ${colorClasses[color]}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`${iconColorClasses[color]} mt-1`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-white">{value}</span>
            {unit && <span className="text-gray-400 text-sm">{unit}</span>}
          </div>
        </div>
        {onAction && ActionIcon && (
          <button
            onClick={onAction}
            className={`${iconColorClasses[color]} hover:scale-110 transition-transform mt-1`}
          >
            <ActionIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function StatsPanel({ side }: StatsPanelProps) {
  const userProfile = useStore((state) => state.userProfile);
  const getBMI = useStore((state) => state.getBMI);
  const getBodyFatPercentage = useStore((state) => state.getBodyFatPercentage);
  const getMonthlyCaloriesBurned = useStore((state) => state.getMonthlyCaloriesBurned);
  const getMonthlyDistance = useStore((state) => state.getMonthlyDistance);
  const getDailyCalorieBalance = useStore((state) => state.getDailyCalorieBalance);
  const getLatestWeight = useStore((state) => state.getLatestWeight);
  const addWeightEntry = useStore((state) => state.addWeightEntry);

  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  const bmi = getBMI();
  const bodyFat = getBodyFatPercentage();
  const monthlyCalories = getMonthlyCaloriesBurned();
  const monthlyDistance = getMonthlyDistance();
  const dailyBalance = getDailyCalorieBalance();
  const latestWeight = getLatestWeight();

  const handleAddWeight = () => {
    if (!newWeight || parseFloat(newWeight) <= 0) return;
    
    addWeightEntry({
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(newWeight),
    });
    
    setNewWeight('');
    setShowAddWeight(false);
  };

  const leftStats = [
    {
      icon: Activity,
      label: 'Aktualna waga',
      value: latestWeight.toFixed(1),
      unit: 'kg',
      color: 'blue' as const,
      onAction: () => setShowAddWeight(true),
      actionIcon: Plus,
    },
    {
      icon: Target,
      label: 'Docelowa waga',
      value: userProfile.targetWeight.toFixed(1),
      unit: 'kg',
      color: 'green' as const,
    },
    {
      icon: Droplet,
      label: 'Tłuszcz w ciele',
      value: bodyFat.toFixed(1),
      unit: '%',
      color: 'cyan' as const,
    },
    {
      icon: TrendingDown,
      label: 'BMI',
      value: bmi.toFixed(1),
      unit: '',
      color: bmi < 25 ? 'green' as const : 'blue' as const,
    },
  ];

  const rightStats = [
    {
      icon: Flame,
      label: 'Spalone kcal (miesiąc)',
      value: monthlyCalories.toFixed(0),
      unit: 'kcal',
      color: 'blue' as const,
    },
    {
      icon: MapPin,
      label: 'Dystans (miesiąc)',
      value: monthlyDistance.toFixed(1),
      unit: 'km',
      color: 'cyan' as const,
    },
    {
      icon: Calendar,
      label: 'Bilans kaloryczny (dziś)',
      value: dailyBalance.toFixed(0),
      unit: 'kcal',
      color: dailyBalance <= 0 ? 'green' as const : 'blue' as const,
    },
  ];

  const stats = side === 'left' ? leftStats : rightStats;

  return (
    <>
      <div className={`w-80 p-4 space-y-4 overflow-y-auto ${side === 'left' ? 'pr-2' : 'pl-2'}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-neon-blue neon-text mb-2">
            {side === 'left' ? 'Parametry Fizyczne' : 'Aktywność'}
          </h2>
          <div className="h-px bg-gradient-to-r from-neon-blue/50 to-transparent"></div>
        </motion.div>

        {stats.map((stat, index) => (
          <StatItem key={stat.label} {...stat} delay={index} />
        ))}

        {/* Additional info */}
        {side === 'left' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-xl p-4 mt-6 border border-neon-blue/20"
          >
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Cel redukcji</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Do celu:</span>
              <span className="text-neon-green text-lg font-bold">
                {(latestWeight - userProfile.targetWeight).toFixed(1)} kg
              </span>
            </div>
            <div className="mt-3 h-2 bg-dark-card rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    100,
                    Math.max(0, ((latestWeight - userProfile.targetWeight) / latestWeight) * 100)
                  )}%`,
                }}
                transition={{ delay: 0.7, duration: 1 }}
                className="h-full bg-gradient-to-r from-neon-green to-neon-cyan"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Weight Modal */}
      <AnimatePresence>
        {showAddWeight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddWeight(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel rounded-xl p-6 border border-neon-blue/30 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Dodaj pomiar wagi</h3>
                <button
                  onClick={() => setShowAddWeight(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Waga (kg)
                  </label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="np. 75.5"
                    min="30"
                    max="300"
                    step="0.1"
                    className="w-full px-4 py-2 bg-dark-card border border-gray-600 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddWeight();
                      }
                    }}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAddWeight(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleAddWeight}
                    disabled={!newWeight || parseFloat(newWeight) <= 0}
                    className={`flex-1 px-4 py-2 bg-neon-blue hover:bg-neon-blue/80 rounded-lg text-white font-semibold transition-colors ${
                      (!newWeight || parseFloat(newWeight) <= 0) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Dodaj
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


