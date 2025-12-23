// Tailwind config for SFGS Admin Portal
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2d3e50",
        secondary: "#4a6572",
        accent: "#f9aa33",
        bg: "#f4f7fa",
        error: "#e57373",
      },
    },
  },
  plugins: [],
};
