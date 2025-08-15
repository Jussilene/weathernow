// [server/index.js]
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

const API = "https://api.openweathermap.org/data/2.5";
const KEY = process.env.OPENWEATHER_KEY; // defina no Render

if (!KEY) {
  console.warn("⚠️  OPENWEATHER_KEY não definida (Render > Environment)");
}

// rota simples para ver se está de pé
app.get("/", (_req, res) => res.send("WeatherNow proxy OK"));

// healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// tempo atual (por cidade OU por lat/lon)
app.get("/api/current", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    let url;

    if (lat && lon) {
      url = `${API}/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric&lang=pt_br`;
    } else if (city) {
      url = `${API}/weather?q=${encodeURIComponent(city)}&appid=${KEY}&units=metric&lang=pt_br`;
    } else {
      return res.status(400).json({ error: "Informe city= ou lat=&lon=" });
    }

    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar tempo atual" });
  }
});

// previsão (lista a cada 3h — a UI agrega por dia)
app.get("/api/forecast", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    let url;

    if (lat && lon) {
      url = `${API}/forecast?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric&lang=pt_br`;
    } else if (city) {
      url = `${API}/forecast?q=${encodeURIComponent(city)}&appid=${KEY}&units=metric&lang=pt_br`;
    } else {
      return res.status(400).json({ error: "Informe city= ou lat=&lon=" });
    }

    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar previsão" });
  }
});

const PORT = process.env.PORT || 5179; // Render injeta PORT
app.listen(PORT, () => {
  console.log(`Proxy ON na porta ${PORT}`);
});
