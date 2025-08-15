// [web/src/components/DetailsGrid.jsx]
import React from "react";
function fmt(t){ return t.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }

export default function DetailsGrid({ uv, humidity, wind, pressure, visibility, sunrise, sunset, dew, moon }) {
  const items = [
    { label:"Índice UV", value: uv },
    { label:"Umidade", value: humidity },
    { label:"Vento", value: wind },
    { label:"Pressão", value: pressure },
    { label:"Visibilidade", value: visibility },
    { label:"Nascer do sol", value: fmt(sunrise) },
    { label:"Pôr do sol", value: fmt(sunset) },
    { label:"Ponto de orvalho", value: dew },
    { label:"Fase da lua", value: moon }
  ];
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((it,i)=>(
        <div key={i} className="glass p-4">
          <div className="text-sm text-slate-500">{it.label}</div>
          <div className="text-xl">{it.value}</div>
        </div>
      ))}
    </div>
  );
}
