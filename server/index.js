// server/index.js  (ESM)
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4001;
const HOST = process.env.HOST || "0.0.0.0";
const KEY  = process.env.OPENWEATHER_KEY || "";
const FRONTEND = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// CORS (libera seus hosts do Vite que você já pôs no .env)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl, devtools, etc.
    if (FRONTEND.some(o => origin.startsWith(o))) return cb(null, true);
    return cb(null, true); // afrouxado para dev
  }
}));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// helper p/ chamar OpenWeather
function ow(path, params = {}) {
  const u = new URL(`https://api.openweathermap.org${path}`);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  u.searchParams.set("appid", KEY);
  return fetch(u);
}

// Geocoding (grátis)
app.get("/api/places", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json([]);
    const r = await ow("/geo/1.0/direct", { q, limit: 5 });
    const arr = await r.json();
    const out = (arr || []).map(p => ({
      name: p.name,
      state: p.state,
      country: p.country,
      lat: p.lat,
      lon: p.lon,
      label: [p.name, p.state, p.country].filter(Boolean).join(", ")
    }));
    res.json(out);
  } catch (err) {
    console.error("PLACES FAIL", err);
    res.status(500).json([]);
  }
});

// fase da lua (aproximação simples – suficiente p/ exibir o texto)
function approxMoonPhase(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  let r = y % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = ((r * 11) % 30) + m + d;
  if (m < 3) r += 2;
  const phase = (r < 0 ? r + 30 : r) / 29.5305882;
  return Math.min(Math.max(phase, 0), 1);
}

// Forecast usando apenas endpoints do plano gratuito
app.get("/api/forecast", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "missing q" });

    // 1) geocoding
    const g = await ow("/geo/1.0/direct", { q, limit: 1 });
    const places = await g.json();
    if (!Array.isArray(places) || !places.length) {
      return res.status(404).json({ error: "place not found" });
    }
    const place = places[0];
    const { lat, lon } = place;

    // 2) tempo atual + previsão 5d/3h (free)
    const [curR, fcR] = await Promise.all([
      ow("/data/2.5/weather", { lat, lon, units: "metric", lang: "pt_br" }),
      ow("/data/2.5/forecast", { lat, lon, units: "metric", lang: "pt_br" })
    ]);

    if (curR.status === 401 || fcR.status === 401) {
      return res.status(401).json({ error: "openweather unauthorized", status: 401 });
    }

    const cur = await curR.json();
    const fc  = await fcR.json();

    // 3) normaliza "current"
    const current = {
      temp: cur.main?.temp,
      feels_like: cur.main?.feels_like,
      humidity: cur.main?.humidity,
      pressure: cur.main?.pressure,
      visibility: cur.visibility,
      wind_speed: cur.wind?.speed,
      sunrise: cur.sys?.sunrise,
      sunset: cur.sys?.sunset,
      weather: cur.weather
    };

    // 4) próximas horas (8 blocos de 3h ≈ 24h)
    const hourly = (fc.list || []).slice(0, 8).map(i => ({
      dt: i.dt,
      temp: i.main?.temp,
      pop: i.pop ?? 0,
      weather: i.weather
    }));

    // 5) resumo diário (até 5 dias)
    const byDay = new Map();
    for (const it of (fc.list || [])) {
      const d = new Date(it.dt * 1000);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      let o = byDay.get(key);
      if (!o) {
        o = {
          dt: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000,
          temp: { min: +Infinity, max: -Infinity },
          pop: 0, _n: 0, ids: {}
        };
      }
      const tmin = it.main?.temp_min ?? it.main?.temp ?? 0;
      const tmax = it.main?.temp_max ?? it.main?.temp ?? 0;
      o.temp.min = Math.min(o.temp.min, tmin);
      o.temp.max = Math.max(o.temp.max, tmax);
      o.pop += (it.pop ?? 0); o._n++;
      const id = it.weather?.[0]?.id;
      if (id) o.ids[id] = (o.ids[id] || 0) + 1;
      byDay.set(key, o);
    }

    const daily = Array.from(byDay.values()).slice(0, 7).map(o => {
      const id = Number(Object.entries(o.ids).sort((a, b) => b[1] - a[1])[0]?.[0]) || 800;
      return { dt: o.dt, temp: o.temp, pop: o._n ? o.pop / o._n : 0, weather: [{ id }] };
    });

    // fase da lua (aprox.) para o 1º dia
    if (daily.length) daily[0].moon_phase = approxMoonPhase(new Date());

    res.json({
      place: {
        name: place.name,
        state: place.state,
        country: place.country,
        lat,
        lon
      },
      current,
      hourly,
      daily
    });
  } catch (err) {
    console.error("FORECAST FAIL", err);
    res.status(500).json({ error: "server error" });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`[WeatherNow] API on http://${HOST}:${PORT}`);
  console.log(`[CORS] Allowed: ${FRONTEND.join(" | ")}`);
});
