/** @type {import('tailwindcss').Config} */
export default {
  // IMPORTANT: These paths must match where your files are
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise Brand Colors (from previous design)
        brand: {
          blue: '#2563eb',   // Primary
          purple: '#7c3aed', // Accent (AI)
          green: '#10b981',  // Success
          red: '#ef4444',    // Danger
          amber: '#f59e0b',  // Warning
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',    // Background
          200: '#e2e8f0',    // Borders
          500: '#64748b',    // Muted Text
          900: '#0f172a',    // Main Text
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}