// web/src/lib/icons.js
// mapeia códigos do OpenWeather -> nome do ícone (arquivo svg em /public/icons/weather)
export function mapWeatherToTipo(id, isNight = false) {
  if (id >= 200 && id < 300) return "storm";
  if (id >= 300 && id < 400) return "drizzle";
  if (id >= 500 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "mist";
  if (id === 800) return isNight ? "clear-night" : "clear";
  if (id > 800) return "cloudy";
  return "clear";
}
