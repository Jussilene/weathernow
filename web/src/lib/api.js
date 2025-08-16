// web/src/lib/api.js

const BASE =
  (typeof window !== "undefined" && window.API_BASE) ||
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_API_BASE || import.meta.env?.VITE_PROXY_URL)) ||
  "https://weathernow-0ya4.onrender.com";

// helper pra montar URL com querystring
function buildUrl(path, params) {
  const url = new URL(path, BASE);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  return url.toString();
}

// fetch com erro claro
async function getJson(url) {
  const r = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Request failed ${r.status} ${r.statusText} - ${txt}`);
  }
  return r.json();
}

/** Clima atual por cidade (usa ?city=) */
export async function getCurrent(city) {
  return getJson(buildUrl("/api/current", { city }));
}

/** Previsão por cidade (usa ?city=) */
export async function getForecast(city) {
  return getJson(buildUrl("/api/forecast", { city }));
}

/** Pacote por cidade (current + forecast) */
export async function getByCity(city) {
  const [current, forecast] = await Promise.all([
    getCurrent(city),
    getForecast(city),
  ]);
  return { current, forecast };
}

/** Clima por coordenadas (lat/lon) — compatível com App.jsx */
export async function getByCoords(lat, lon) {
  const [current, forecast] = await Promise.all([
    getJson(buildUrl("/api/current", { lat, lon })),
    getJson(buildUrl("/api/forecast", { lat, lon })),
  ]);
  return { current, forecast };
}

// opcional: exporta a BASE pra debug
export const API_BASE = BASE;
