// [web/src/components/DailyList.jsx]
import React, { useMemo } from "react";
import { toC } from "../lib/format";
import { mapWeatherToTipo, getIconUrl } from "../lib/icons";

export default function DailyList({ forecast }) {
  const days = useMemo(() => {
    if (!forecast?.list?.length) return [];

    // agrupa por data local e mantém ordem cronológica
    const by = new Map();
    forecast.list.forEach((it) => {
      const d = new Date(it.dt * 1000);
      const label = d.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });
      if (!by.has(label)) by.set(label, []);
      by.get(label).push(it);
    });

    return Array.from(by.entries())
      .slice(0, 6) // mostra 6 dias
      .map(([label, arr]) => {
        const temps = arr.map((a) => a.main.temp);
        const mid = arr[Math.floor(arr.length / 2)] || arr[0];

        const code = mid?.weather?.[0]?.id ?? 800;
        const tipo = mapWeatherToTipo(code, false); // ícone diurno para previsão
        const iconUrl = getIconUrl(tipo, 96) || getIconUrl(tipo, 72);

        return {
          label,
          min: Math.min(...temps),
          max: Math.max(...temps),
          iconUrl,
        };
      });
  }, [forecast]);

  if (!days.length) {
    return (
      <div className="glass p-4">
        <div className="mb-2 font-medium">Na semana</div>
        <div className="text-slate-600">Sem dados de previsão.</div>
      </div>
    );
  }

  return (
    <div className="glass p-4">
      <div className="mb-2 font-medium">Na semana</div>
      <ul className="divide-y divide-white/50">
        {days.map((d, i) => (
          <li key={i} className="py-3 flex items-center justify-between">
            <div className="w-28 capitalize">{d.label}</div>

            {d.iconUrl ? (
              <img
                src={d.iconUrl}
                alt=""
                aria-hidden="true"
                className="weather-icon-sm"
                width={28}
                height={28}
              />
            ) : (
              <span className="opacity-60">—</span>
            )}

            <div className="ml-auto flex gap-4">
              <span className="text-slate-600">{toC(d.min)}</span>
              <span className="font-semibold">{toC(d.max)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
