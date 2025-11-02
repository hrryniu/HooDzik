'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import HumanModel from '@/components/HumanModel';
import StatsPanel from '@/components/StatsPanel';
import Navigation from '@/components/Navigation';
import WorkoutsTab from '@/components/WorkoutsTab';
import StatisticsTab from '@/components/StatisticsTab';
import ProfileTab from '@/components/ProfileTab';
import AIAssistantTab from '@/components/AIAssistantTab';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const currentTab = useStore((state) => state.currentTab);
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-neon-blue text-2xl neon-text animate-pulse">
          Inicjalizacja HooDzik...
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <main className={`w-screen h-screen relative overflow-hidden ${isDark ? 'bg-dark-bg' : 'bg-gray-50'}`}>
      {/* Animated background grid */}
      <div className={`absolute inset-0 ${
        isDark 
          ? 'bg-gradient-to-br from-dark-bg via-dark-panel to-dark-bg' 
          : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'
      }`}>
        <div className={`absolute inset-0 ${isDark ? 'opacity-20' : 'opacity-10'}`}
             style={{
               backgroundImage: `
                 linear-gradient(${isDark ? 'rgba(0, 243, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)'} 1px, transparent 1px),
                 linear-gradient(90deg, ${isDark ? 'rgba(0, 243, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)'} 1px, transparent 1px)
               `,
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="relative z-10 h-full pt-20 pb-4 px-4">
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex"
            >
              {/* Left Stats Panel */}
              <StatsPanel side="left" />

              {/* Center - 3D Model */}
              <div className="flex-1 flex items-center justify-center relative">
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <h1 className={`text-4xl font-bold text-center ${isDark ? 'neon-text' : 'text-blue-600'}`}>
                    HooDzik
                  </h1>
                  <p className={`text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Zaawansowany System Monitoringu Zdrowia
                  </p>
                </div>
                
                <HumanModel />

                {/* Scan line effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="scan-line w-full h-0.5 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-30"></div>
                </div>
              </div>

              {/* Right Stats Panel */}
              <StatsPanel side="right" />
            </motion.div>
          )}

          {currentTab === 'workouts' && (
            <motion.div
              key="workouts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <WorkoutsTab />
            </motion.div>
          )}

          {currentTab === 'statistics' && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <StatisticsTab />
            </motion.div>
          )}

          {currentTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <ProfileTab />
            </motion.div>
          )}

          {currentTab === 'ai-assistant' && (
            <motion.div
              key="ai-assistant"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <AIAssistantTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corner decorations */}
      <div className={`absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 ${isDark ? 'border-neon-blue/30' : 'border-blue-500/30'} pointer-events-none`}></div>
      <div className={`absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 ${isDark ? 'border-neon-blue/30' : 'border-blue-500/30'} pointer-events-none`}></div>
      <div className={`absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 ${isDark ? 'border-neon-blue/30' : 'border-blue-500/30'} pointer-events-none`}></div>
      <div className={`absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 ${isDark ? 'border-neon-blue/30' : 'border-blue-500/30'} pointer-events-none`}></div>
    </main>
  );
}


