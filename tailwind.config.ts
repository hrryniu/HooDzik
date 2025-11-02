import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f3ff',
          cyan: '#00ffff',
          green: '#00ff88',
          purple: '#b400ff',
          pink: '#ff00ff',
        },
        dark: {
          bg: '#0a0e17',
          panel: '#0f1419',
          card: '#141922',
        }
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 243, 255, 0.5)',
        'neon-cyan': '0 0 20px rgba(0, 255, 255, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};
export default config;


