import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Gender = 'male' | 'female';
export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph';
export type Theme = 'dark' | 'light';

export interface UserProfile {
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg
  bodyFat: number; // %
  bodyType: BodyType;
}

export interface Workout {
  id: string;
  type: string;
  date: Date;
  duration: number; // minutes
  caloriesBurned: number;
  distance?: number; // km
  heartRate?: number;
  pulse?: number;
  steps?: number;
  source: 'manual' | 'xiaomi';
}

export interface DailyStats {
  date: string;
  weight: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  steps: number;
  distance: number;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  weight: number; // kg
  note?: string;
}

interface StoreState {
  // User Profile
  userProfile: UserProfile;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  
  // Workouts
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  deleteWorkout: (id: string) => void;
  
  // Daily Stats
  dailyStats: DailyStats[];
  addDailyStats: (stats: DailyStats) => void;
  
  // Weight Tracking
  weightEntries: WeightEntry[];
  addWeightEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  deleteWeightEntry: (id: string) => void;
  updateWeightEntry: (id: string, entry: Partial<Omit<WeightEntry, 'id'>>) => void;
  
  // UI State
  currentTab: 'home' | 'workouts' | 'statistics' | 'profile' | 'ai-assistant';
  setCurrentTab: (tab: 'home' | 'workouts' | 'statistics' | 'profile' | 'ai-assistant') => void;
  
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Bluetooth
  isBluetoothConnected: boolean;
  setBluetoothConnected: (connected: boolean) => void;
  
  // Calculated values
  getBMI: () => number;
  getBodyFatPercentage: () => number;
  getBMR: () => number;
  getTDEE: (activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active') => number;
  getMonthlyCaloriesBurned: () => number;
  getMonthlyDistance: () => number;
  getDailyCalorieBalance: () => number;
  getLatestWeight: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial User Profile
      userProfile: {
        gender: 'male',
        age: 30,
        height: 175,
        weight: 80,
        targetWeight: 75,
        bodyFat: 20,
        bodyType: 'mesomorph',
      },
      
      setUserProfile: (profile) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        })),
      
      // Workouts
      workouts: [],
      
      addWorkout: (workout) =>
        set((state) => ({
          workouts: [
            ...state.workouts,
            { ...workout, id: Date.now().toString(), date: new Date(workout.date) },
          ],
        })),
      
      deleteWorkout: (id) =>
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        })),
      
      // Daily Stats
      dailyStats: [],
      
      addDailyStats: (stats) =>
        set((state) => {
          const existing = state.dailyStats.findIndex((s) => s.date === stats.date);
          if (existing >= 0) {
            const updated = [...state.dailyStats];
            updated[existing] = stats;
            return { dailyStats: updated };
          }
          return { dailyStats: [...state.dailyStats, stats] };
        }),
      
      // Weight Tracking
      weightEntries: [],
      
      addWeightEntry: (entry) =>
        set((state) => ({
          weightEntries: [
            ...state.weightEntries,
            { ...entry, id: Date.now().toString() },
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        })),
      
      deleteWeightEntry: (id) =>
        set((state) => ({
          weightEntries: state.weightEntries.filter((w) => w.id !== id),
        })),
      
      updateWeightEntry: (id, entry) =>
        set((state) => ({
          weightEntries: state.weightEntries
            .map((w) => (w.id === id ? { ...w, ...entry } : w))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        })),
      
      // UI State
      currentTab: 'home',
      setCurrentTab: (tab) => set({ currentTab: tab }),
      
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      
      // Bluetooth
      isBluetoothConnected: false,
      setBluetoothConnected: (connected) => set({ isBluetoothConnected: connected }),
      
      // Calculated values
      getBMI: () => {
        const { height } = get().userProfile;
        // Get latest weight from history or fallback to profile weight
        const entries = get().weightEntries;
        const weight = entries.length > 0 ? entries[0].weight : get().userProfile.weight;
        const heightInMeters = height / 100;
        return weight / (heightInMeters * heightInMeters);
      },

      // Estimate body fat percentage using BMI and age
      getBodyFatPercentage: () => {
        const { age, gender } = get().userProfile;
        const bmi = get().getBMI();
        
        // Deurenberg formula for body fat percentage
        if (gender === 'male') {
          return (1.20 * bmi) + (0.23 * age) - 16.2;
        } else {
          return (1.20 * bmi) + (0.23 * age) - 5.4;
        }
      },

      // Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
      getBMR: () => {
        const { height, age, gender } = get().userProfile;
        // Get latest weight from history or fallback to profile weight
        const entries = get().weightEntries;
        const weight = entries.length > 0 ? entries[0].weight : get().userProfile.weight;
        
        if (gender === 'male') {
          // BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
          return (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
          // BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
          return (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
      },

      // Calculate Total Daily Energy Expenditure
      getTDEE: (activityLevel) => {
        const bmr = get().getBMR();
        
        const activityMultipliers = {
          sedentary: 1.2,      // Siedzący tryb życia (brak ćwiczeń)
          light: 1.375,        // Lekka aktywność (ćwiczenia 1-3 dni/tydzień)
          moderate: 1.55,      // Umiarkowana aktywność (ćwiczenia 3-5 dni/tydzień)
          active: 1.725,       // Wysoka aktywność (ćwiczenia 6-7 dni/tydzień)
          very_active: 1.9     // Bardzo wysoka aktywność (ciężkie ćwiczenia 2x dziennie)
        };
        
        return bmr * activityMultipliers[activityLevel];
      },
      
      getMonthlyCaloriesBurned: () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        return get().workouts
          .filter((w) => new Date(w.date) >= firstDayOfMonth)
          .reduce((sum, w) => sum + w.caloriesBurned, 0);
      },
      
      getMonthlyDistance: () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        return get().workouts
          .filter((w) => new Date(w.date) >= firstDayOfMonth && w.distance)
          .reduce((sum, w) => sum + (w.distance || 0), 0);
      },
      
      getDailyCalorieBalance: () => {
        const today = new Date().toISOString().split('T')[0];
        const todayStats = get().dailyStats.find((s) => s.date === today);
        
        if (!todayStats) return 0;
        return todayStats.caloriesConsumed - todayStats.caloriesBurned;
      },
      
      getLatestWeight: () => {
        const entries = get().weightEntries;
        if (entries.length === 0) {
          return get().userProfile.weight;
        }
        return entries[0].weight; // entries are sorted by date desc
      },
    }),
    {
      name: 'neofit-storage',
    }
  )
);


