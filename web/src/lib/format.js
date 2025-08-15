// [web/src/lib/format.js]
export const toC = n => `${Math.round(n)}°`;
export function bgFromWeather(code, isNight) {
  if (isNight) return "bg-night text-slate-200";
  if (code>=200 && code<600) return "bg-rain";
  if (code>=600 && code<700) return "bg-cloudy";
  if (code>=700 && code<800) return "bg-cloudy";
  if (code===800) return "bg-sunny";
  if (code>800) return "bg-cloudy";
  return "bg-day";
}
export const kmh = mps => Math.round(mps*3.6);
