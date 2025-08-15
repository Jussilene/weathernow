// [server/index.js]
const express = require("express");
// Em Node 18+ já existe fetch global; se preferir, descomente a linha abaixo.
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

const PORT = process.env.PORT || 5179;
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;

function json(res, data, status = 200) {
  res.set("Cache-Control", "public, max-age=120"); // 2 min
  res.status(status).json(data);
}

app.get("/", (_req, res) => {
  res.type("text/plain").send("WeatherNow proxy OK");
});

// Clima atual: por cidade OU por lat/lon
app.get("/api/current", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    let url;
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&lang=pt_br&units=metric&appid=${OPENWEATHER_KEY}`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=pt_br&units=metric&appid=${OPENWEATHER_KEY}`;
    } else {
      return json(res, { error: "Informe city ou lat/lon" }, 400);
    }

    const r = await fetch(url);
    const data = await r.json();
    return json(res, data, r.ok ? 200 : r.status);
  } catch (err) {
    return json(res, { error: "proxy_current_failed", detail: String(err) }, 500);
  }
});

// Previsão 5 dias (3h): por cidade OU por lat/lon
app.get("/api/forecast", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    let url;
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&lang=pt_br&units=metric&appid=${OPENWEATHER_KEY}`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&lang=pt_br&units=metric&appid=${OPENWEATHER_KEY}`;
    } else {
      return json(res, { error: "Informe city ou lat/lon" }, 400);
    }

    const r = await fetch(url);
    const data = await r.json();
    return json(res, data, r.ok ? 200 : r.status);
  } catch (err) {
    return json(res, { error: "proxy_forecast_failed", detail: String(err) }, 500);
  }
});

app.listen(PORT, () => {
  console.log("Proxy ON na porta", PORT);
});
