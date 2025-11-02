'use client';

import { useStore } from '@/store/useStore';
import { Home, Activity, BarChart3, User, Bluetooth, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navigation() {
  const currentTab = useStore((state) => state.currentTab);
  const setCurrentTab = useStore((state) => state.setCurrentTab);
  const isBluetoothConnected = useStore((state) => state.isBluetoothConnected);
  const theme = useStore((state) => state.theme);

  const isDark = theme === 'dark';

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'workouts' as const, label: 'Treningi', icon: Activity },
    { id: 'statistics' as const, label: 'Statystyki', icon: BarChart3 },
    { id: 'ai-assistant' as const, label: 'AI Asystent', icon: Sparkles },
    { id: 'profile' as const, label: 'Profil', icon: User },
  ];

  return (
    <nav className={`absolute top-0 left-0 right-0 z-50 border-b ${
      isDark 
        ? 'glass-panel border-neon-blue/30' 
        : 'bg-white/80 backdrop-blur-md border-gray-200'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              isDark 
                ? 'bg-neon-blue/20 border-neon-blue' 
                : 'bg-blue-100 border-blue-500'
            }`}>
              <Activity className={`w-6 h-6 ${isDark ? 'text-neon-blue' : 'text-blue-600'}`} />
            </div>
            <span className={`text-xl font-bold ${isDark ? 'neon-text' : 'text-blue-600'}`}>HooDzik</span>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 relative transition-colors duration-300 ${
                    isActive 
                      ? isDark ? 'text-neon-blue' : 'text-blue-600' 
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                        isDark ? 'bg-neon-blue shadow-neon-blue' : 'bg-blue-600'
                      }`}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bluetooth Status */}
          <div className="flex items-center space-x-2">
            <Bluetooth
              className={`w-5 h-5 ${
                isBluetoothConnected 
                  ? isDark ? 'text-neon-green' : 'text-green-600' 
                  : 'text-gray-500'
              }`}
            />
            <span className={`text-sm ${
              isBluetoothConnected 
                ? isDark ? 'text-neon-green' : 'text-green-600' 
                : 'text-gray-500'
            }`}>
              {isBluetoothConnected ? 'Połączono' : 'Niepołączony'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}


