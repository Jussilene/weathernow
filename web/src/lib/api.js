// web/src/lib/api.js

// Resolve a base da API:
// 1) Usa VITE_API_BASE se existir;
// 2) Senão, infere do host atual (porta 4001).
const API_BASE = (() => {
  const env = import.meta.env?.VITE_API_BASE;
  if (env && /^https?:\/\//i.test(env)) {
    return env.replace(/\/$/, "");
  }
  try {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:4001`;
  } catch {
    return "http://localhost:4001";
  }
})();

export function getApiBase() {
  return API_BASE;
}

function buildUrl(path, params = {}) {
  const u = new URL(path.replace(/^\//, ""), API_BASE + "/");
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, v);
  });
  return u.toString();
}

export async function searchPlaces(q) {
  const url = buildUrl("/api/places", { q });
  // console.debug("GET", url);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`places ${r.status}`);
  return r.json();
}

export async function fetchWeatherByQuery(q) {
  const url = buildUrl("/api/forecast", { q });
  // console.debug("GET", url);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`forecast ${r.status}`);
  return r.json();
}
