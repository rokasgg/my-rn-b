/** @type {import('tailwindcss').Config} */
// Keep these values in sync with `colors` in src/lib/theme.ts (native-prop
// colors like icon/tabBarStyle colors can't consume Tailwind classes).
const colors = {
  white: '#ffffff',
  black: '#000000',
  gray: '#8e8e93',
  borderLight: '#e5e7eb',
  borderDark: '#27272a',
};

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors,
    },
  },
  plugins: [],
};
