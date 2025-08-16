// WEATHERNOW/server/index.js
import express from "express";
import compression from "compression";
import cors from "cors";

const app = express();

// compressão gzip
app.use(compression());

// CORS: libera seu site (GitHub Pages) e local dev
app.use(
  cors({
    origin: ["https://jussilene.github.io", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET"],
  })
);

const API_KEY = process.env.OPENWEATHER_KEY;
if (!API_KEY) {
  console.error("Faltando OPENWEATHER_KEY nas variáveis de ambiente!");
}

app.get("/", (req, res) => res.type("text/plain").send("WeatherNow proxy ok"));
app.get("/healthz", (req, res) => res.json({ ok: true }));

// cache simples em memória
const cache = new Map(); // key -> { expires, data }
const setCache = (key, data, ttlMs) => cache.set(key, { expires: Date.now() + ttlMs, data });
const getCache = (key) => {
  const hit = cache.get(key);
  if (!hit || Date.now() > hit.expires) return null;
  return hit.data;
};

async function proxy(endpoint, city, ttlMs) {
  const key = `${endpoint}:${city}`;
  const hit = getCache(key);
  if (hit) return hit;

  const url = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric&lang=pt_br`;

  const r = await fetch(url, { headers: { "User-Agent": "WeatherNow-Proxy/1.0" } });
  if (!r.ok) throw new Error(`OpenWeather falhou: ${r.status}`);
  const json = await r.json();
  setCache(key, json, ttlMs);
  return json;
}

app.get("/api/current", async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "Parâmetro ?city é obrigatório" });
  try {
    const data = await proxy("weather", city, 5 * 60 * 1000); // 5min
    res.set("Cache-Control", "public, max-age=60");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

app.get("/api/forecast", async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "Parâmetro ?city é obrigatório" });
  try {
    const data = await proxy("forecast", city, 10 * 60 * 1000); // 10min
    res.set("Cache-Control", "public, max-age=120");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy WeatherNow rodando na porta ${port}`));
