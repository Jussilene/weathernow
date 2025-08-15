// [server/index.js]
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());

const API = "https://api.openweathermap.org/data/2.5";

function buildUrl(path, params) {
  const url = new URL(API + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("appid", process.env.OPENWEATHER_KEY);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "pt_br");
  return url.toString();
}

app.get("/api/weather/current", async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    const url = buildUrl("/weather", lat && lon ? { lat, lon } : { q });
    const r = await fetch(url);
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/weather/forecast", async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    const url = buildUrl("/forecast", lat && lon ? { lat, lon } : { q });
    const r = await fetch(url);
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 5179;
app.listen(port, () => console.log("Proxy ON na porta", port));
