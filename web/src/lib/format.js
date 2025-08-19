export const toC = (k) => Math.round(k - 273.15);
export const kmh = (ms) => Math.round(ms * 3.6);
export const localDate = (ms) => new Date(ms);

export function fmtHour(ms){
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// janela para pôr/nascer do sol (golden hour)
export function isGoldenHour(now, sunrise, sunset, spanMin = 75){
  const span = spanMin * 60; // em segundos
  return (
    (now >= (sunrise - span) && now <= (sunrise + span)) ||
    (now >= (sunset  - span) && now <= (sunset  + span))
  );
}

export function themeFromWeather(code, isNight, golden=false){
  if (isNight) return "bg-night";
  if (golden)   return "bg-sunset";

  if (code >= 200 && code < 300) return "bg-storm";   // trovoadas
  if (code >= 300 && code < 600) return "bg-rain";    // chuva/garoa
  if (code >= 600 && code < 700) return "bg-snow";    // neve
  if (code >= 700 && code < 800) return "bg-mist";    // névoa/poeira
  if (code === 800) return "bg-day";                  // céu limpo
  if (code > 800)  return "bg-cloudy";                // nuvens
  return "bg-day";
}
