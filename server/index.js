import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5179;
const KEY = process.env.OPENWEATHER_KEY;

app.get("/", (req, res) => {
  res.send("WeatherNow proxy ok");
});

app.get("/api/current", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    let url;
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${KEY}&lang=pt_br&units=metric`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}&lang=pt_br&units=metric`;
    } else {
      return res.status(400).json({ error: "Use ?city=Curitiba,BR ou ?lat=..&lon=.." });
    }

    const r = await fetch(url);
    const json = await r.json();
    res.json(json);
  } catch (e) {
    res.status(500).json({ error: "current failed", detail: String(e) });
  }
});

app.get("/api/forecast", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    let url;
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${KEY}&lang=pt_br&units=metric`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}&lang=pt_br&units=metric`;
    } else {
      return res.status(400).json({ error: "Use ?city=Curitiba,BR ou ?lat=..&lon=.." });
    }

    const r = await fetch(url);
    const json = await r.json();
    res.json(json);
  } catch (e) {
    res.status(500).json({ error: "forecast failed", detail: String(e) });
  }
});

app.listen(PORT, () => {
  console.log("Proxy ON na porta", PORT);
});
