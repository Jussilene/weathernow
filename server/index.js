// WEATHERNOW/server/index.js
import express from "express";
import compression from "compression";
import cors from "cors";

const app = express();

// compressão gzip
app.use(compression());

// ===== CORS =====
const ALLOWED = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: ALLOWED.length ? ALLOWED : true,
    methods: ["GET"],
  })
);

// ===== API KEY =====
const API_KEY = process.env.OPENWEATHER_KEY;
if (!API_KEY) {
  console.error("Faltando OPENWEATHER_KEY nas variáveis de ambiente!");
}

// ===== CACHE EM MEMÓRIA =====
const cache = new Map(); // key -> { expires, data }
const setCache = (key, data, ttlMs) => cache.set(key, { expires: Date.now() + ttlMs, data });
const getCache = (key) => {
  const hit = cache.get(key);
  if (!hit || Date.now() > hit.expires) return null;
  return hit.data;
};

// ===== HELPERS =====
function buildOWUrl(endpoint, { city, lat, lon }) {
  const u = new URL(`https://api.openweathermap.org/data/2.5/${endpoint}`);
  if (city) u.searchParams.set("q", city);
  if (lat && lon) {
    u.searchParams.set("lat", lat);
    u.searchParams.set("lon", lon);
  }
  u.searchParams.set("appid", API_KEY);
  u.searchParams.set("units", "metric");
  u.searchParams.set("lang", "pt_br");
  return u.toString();
}

async function proxy(endpoint, params, ttlMs) {
  const key = `${endpoint}:${params.city || `${params.lat},${params.lon}`}`;
  const hit = getCache(key);
  if (hit) return hit;

  const url = buildOWUrl(endpoint, params);
  const r = await fetch(url, { headers: { "User-Agent": "WeatherNow-Proxy/1.0" } });
  if (!r.ok) throw new Error(`OpenWeather falhou: ${r.status}`);
  const json = await r.json();
  setCache(key, json, ttlMs);
  return json;
}

// ===== ROTAS =====
app.get("/", (req, res) => res.type("text/plain").send("WeatherNow proxy ok"));
app.get("/health", (_, res) => res.send("ok"));
app.get("/healthz", (_, res) => res.json({ ok: true }));

app.get("/api/current", async (req, res) => {
  const { city, lat, lon } = req.query;
  if (!city && !(lat && lon)) {
    return res.status(400).json({ error: "Informe ?city OU ?lat & ?lon" });
  }
  try {
    const data = await proxy("weather", { city, lat, lon }, 5 * 60 * 1000); // 5 min
    res.set("Cache-Control", "public, max-age=60");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

app.get("/api/forecast", async (req, res) => {
  const { city, lat, lon } = req.query;
  if (!city && !(lat && lon)) {
    return res.status(400).json({ error: "Informe ?city OU ?lat & ?lon" });
  }
  try {
    const data = await proxy("forecast", { city, lat, lon }, 10 * 60 * 1000); // 10 min
    res.set("Cache-Control", "public, max-age=120");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

// ===== START =====
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy WeatherNow rodando na porta ${port}`));
