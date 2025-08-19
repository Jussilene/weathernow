/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        day: "#eaf4ff",
        dusk: "#dfe7f2",
        night: "#0f172a"
      },
      backgroundImage: {
        sunny: "linear-gradient(180deg,#bde0ff,#fff7cc)",
        cloudy: "linear-gradient(180deg,#cfd8e3,#eef2f7)",
        rain: "linear-gradient(180deg,#b6c7d6,#9db6c7)",
        night: "linear-gradient(180deg,#0f172a,#1e293b)"
      }
    }
  },
  plugins: []
};
