// web/src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getByCoords, getByCity } from "./lib/api.js";
import { bgFromWeather, toC, kmh } from "./lib/format.js";
import { moonPhase, moonLabel } from "./lib/moon.js";
import { mapWeatherToTipo } from "./lib/icons.js";

import SearchBar from "./components/SearchBar.jsx";
import CurrentCard from "./components/CurrentCard.jsx";
import DetailsGrid from "./components/DetailsGrid.jsx";
import HourlyChart from "./components/HourlyChart.jsx";
import DailyList from "./components/DailyList.jsx";
import InstallPWA from "./components/InstallPWA.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadByGeo() {
    setLoading(true);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      setData(await getByCoords(lat, lon));
    } catch {
      setData(await getByCity("Curitiba,BR")); // fallback
    } finally {
      setLoading(false);
    }
  }

  async function search(q) {
    setLoading(true);
    try {
      setData(await getByCity(q));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadByGeo();
  }, []);

  const theme = useMemo(() => {
    if (!data?.current?.weather?.[0]) return "bg-day";
    const w = data.current.weather[0];
    const isNight =
      data.current.dt < data.current.sys.sunrise ||
      data.current.dt > data.current.sys.sunset;
    return bgFromWeather(w.id, isNight);
  }, [data]);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme} flex items-center justify-center`}>
        <div className="glass p-6">Carregando clima…</div>
      </div>
    );
  }

  if (!data?.current?.name) {
    return <div className="p-6">Não foi possível obter dados.</div>;
  }

  // Fase da lua
  const mp = moonPhase(new Date((data.current.dt + data.current.timezone) * 1000));
  const moonText = moonLabel(mp);

  // Ícone/tema
  const isNight =
    data.current.dt < data.current.sys.sunrise ||
    data.current.dt > data.current.sys.sunset;
  const weatherCode = data.current.weather[0]?.id ?? 800;
  const tipoIcon = mapWeatherToTipo(weatherCode, isNight);

  return (
    <div className={`min-h-screen ${theme} transition-colors`}>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <SearchBar onSearch={search} defaultValue={data.current.name} />

        <CurrentCard
          city={`${data.current.name}, ${data.current.sys?.country || ""}`}
          temp={toC(data.current.main.temp)}
          desc={data.current.weather[0].description}
          hi={toC(data.current.main.temp_max)}
          lo={toC(data.current.main.temp_min)}
          tipoIcon={tipoIcon}
        />

        <DetailsGrid
          uv="—"
          humidity={`${data.current.main.humidity}%`}
          wind={`${kmh(data.current.wind.speed)} km/h`}
          pressure={`${Math.round(data.current.main.pressure)} hPa`}
          visibility={`${(data.current.visibility / 1000).toFixed(1)} km`}
          sunrise={new Date((data.current.sys.sunrise + data.current.timezone) * 1000)}
          sunset={new Date((data.current.sys.sunset + data.current.timezone) * 1000)}
          dew="—"
          moon={moonText}
        />

        <HourlyChart forecast={data.forecast} />
        <DailyList forecast={data.forecast} />

        <InstallPWA />
        <Footer />
      </div>
    </div>
  );
}
