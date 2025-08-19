// web/src/components/DetailsGrid.jsx
import React, { useMemo } from "react";
import { phaseKeyFromDate, moonLabel } from "../lib/moon.js";

// Mapeia chave -> caminho da imagem na sua pasta /public/assets/moon
const MOON_IMAGES = {
  nova:                 new URL("../assets/moon/lua.nova.png", import.meta.url).href,
  crescente:            new URL("../assets/moon/lua.crescente.png", import.meta.url).href,
  "quarto.crescente":   new URL("../assets/moon/lua.quarto.crescente.png", import.meta.url).href,
  "gibosa.crescente":   new URL("../assets/moon/lua.gibosa.crescente.png", import.meta.url).href,
  cheia:                new URL("../assets/moon/lua.cheia.png", import.meta.url).href,
  "gibosa.minguante":   new URL("../assets/moon/lua.gibosa.minguante.png", import.meta.url).href,
  "quarto.minguante":   new URL("../assets/moon/lua.quarto.minguante.png", import.meta.url).href,
  minguante:            new URL("../assets/moon/lua.minguante.png", import.meta.url).href,
};

// Converte fase 0..1 (OpenWeather OneCall) -> nossa “key” + label
function keyFromApiPhase(p) {
  if (p < 0.03 || p > 0.97) return "nova";
  if (p < 0.25) return "crescente";
  if (p < 0.27) return "quarto.crescente";
  if (p < 0.47) return "gibosa.crescente";
  if (p < 0.53) return "cheia";
  if (p < 0.75) return "gibosa.minguante";
  if (p < 0.77) return "quarto.minguante";
  return "minguante";
}

export default function DetailsGrid({
  uv = "—",
  humidity = "—",
  wind = "—",
  pressure = "—",
  visibility = "—",
  sunrise,
  sunset,
  timezoneOffset = 0,
  // quando o server mandar o campo moon_phase (0..1)
  moonPhase0to1 = null,
}) {
  // Fase da lua (key + label + imagem)
  const { moonKey, moonText, moonImg } = useMemo(() => {
    let key;

    if (typeof moonPhase0to1 === "number") {
      // pela API (0..1)
      key = keyFromApiPhase(moonPhase0to1);
    } else {
      // cálculo local pela data “agora” ajustada ao fuso
      const nowLocal = new Date(Date.now() + timezoneOffset * 1000);
      key = phaseKeyFromDate(nowLocal);
    }

    const img = MOON_IMAGES[key];
    const label =
      {
        nova: "Lua nova",
        crescente: "Lua crescente",
        "quarto.crescente": "Quarto crescente",
        "gibosa.crescente": "Gibosa crescente",
        cheia: "Lua cheia",
        "gibosa.minguante": "Gibosa minguante",
        "quarto.minguante": "Quarto minguante",
        minguante: "Lua minguante",
      }[key] || "Lua";

    return { moonKey: key, moonText: label, moonImg: img };
  }, [moonPhase0to1, timezoneOffset]);

  const fmtTime = (d) =>
    d instanceof Date
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "—";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="glass p-4">
        <div className="muted">Índice UV</div>
        <div className="text-2xl font-bold">{uv}</div>
      </div>

      <div className="glass p-4">
        <div className="muted">Umidade</div>
        <div className="text-2xl font-bold">{humidity}</div>
      </div>

      <div className="glass p-4">
        <div className="muted">Vento</div>
        <div className="text-2xl font-bold">{wind}</div>
      </div>

      <div className="glass p-4">
        <div className="muted">Pressão</div>
        <div className="text-2xl font-bold">{pressure}</div>
      </div>

      <div className="glass p-4">
        <div className="muted">Visibilidade</div>
        <div className="text-2xl font-bold">{visibility}</div>
      </div>

      <div className="glass p-4">
        <div className="muted">Nascer do sol</div>
        <div className="text-2xl font-bold">{fmtTime(sunrise)}</div>
      </div>

      <div className="glass p-4">
        <div className="muted">Pôr do sol</div>
        <div className="text-2xl font-bold">{fmtTime(sunset)}</div>
      </div>

      <div className="glass p-4 flex items-center gap-3">
        <div>
          <div className="muted">Fase da lua</div>
          <div className="text-2xl font-bold capitalize">{moonText}</div>
        </div>
        {moonImg && (
          <img
            src={moonImg}
            alt={moonText}
            width={56}
            height={56}
            style={{ objectFit: "contain" }}
          />
        )}
      </div>
    </div>
  );
}
