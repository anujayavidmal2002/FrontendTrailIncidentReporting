module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#177a2b', // dark green
          light: '#34c759',
          dark: '#135c1f',
        },
        secondary: '#2ecc40', // lighter green
        accent: '#b7e4c7', // gentle nature green
        hazardLow: '#ffd600',
        hazardMedium: '#ff9800',
        hazardHigh: '#e53935',
      },
    },
  },
  plugins: [],
};
