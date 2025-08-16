// web/src/lib/api.js

// 1) Lê a base da API (em build) e garante que fica certinha
function normalizeBase(input) {
  // pega do env do Vite (Render Static injeta em build) ou usa fallback
  let base =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
    "https://weathernow-0ya4.onrender.com";

  // se veio algo explícito via argumento, usa (mantém para debug futuro)
  if (input) base = input;

  // remove espaços/quebras nas pontas
  base = String(base).trim();

  // se esqueceram do protocolo, força https
  if (!/^https?:\/\//i.test(base)) base = "https://" + base;

  // remove barras finais duplicadas
  base = base.replace(/\/+$/, "");
  return base;
}

const BASE = normalizeBase();

// 2) helper pra montar URL com querystring sem surpresas
function buildUrl(path, params = {}) {
  const pathClean = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${BASE}${pathClean}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  return url.toString();
}

// 3) fetch com erro claro
async function getJson(url) {
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Request failed ${r.status} ${r.statusText} - ${txt}`);
  }
  return r.json();
}

// Funções da API
export async function getCurrent(city) {
  return getJson(buildUrl("/api/current", { city }));
}

export async function getForecast(city) {
  return getJson(buildUrl("/api/forecast", { city }));
}

export async function getByCity(city) {
  const [current, forecast] = await Promise.all([
    getCurrent(city),
    getForecast(city),
  ]);
  return { current, forecast };
}

export async function getByCoords(lat, lon) {
  const [current, forecast] = await Promise.all([
    getJson(buildUrl("/api/current", { lat, lon })),
    getJson(buildUrl("/api/forecast", { lat, lon })),
  ]);
  return { current, forecast };
}

// exporta pra debug
export const API_BASE = BASE;
