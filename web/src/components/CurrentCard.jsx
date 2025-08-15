import React from "react";
import { getIconUrl } from "../lib/icons";

export default function CurrentCard({ city, temp, desc, hi, lo, tipoIcon }) {
  // pega a URL do ícone — tamanho agora é gerenciado no CSS (.weather-icon)
  const iconUrl = getIconUrl(tipoIcon);

  return (
    <div className="glass p-6 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_auto] gap-4 items-center">
      {/* Dados da cidade */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">{city}</h1>
        <p className="text-slate-600 capitalize">{desc}</p>
      </div>

      {/* Ícone do clima */}
      <img src={iconUrl} alt={desc} className="weather-icon" />

      {/* Temperaturas */}
      <div className="text-right">
        <div className="text-5xl md:text-7xl font-bold leading-none">{temp}</div>
        <div className="mt-2">Máx {hi} · Mín {lo}</div>
      </div>
    </div>
  );
}
