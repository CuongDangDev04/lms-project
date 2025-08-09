/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",          
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {
      scale: {
        150: "1.8", // Thêm scale-150
      },
    },
  },
  plugins: [],
};
