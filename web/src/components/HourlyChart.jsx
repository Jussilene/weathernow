// [web/src/components/HourlyChart.jsx]
import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function HourlyChart({ forecast }) {
  // pega próximas 12h a partir da lista 3/3h
  const data = useMemo(()=>{
    return forecast.list.slice(0, 12).map(it => ({
      t: new Date(it.dt*1000).toLocaleTimeString([], { hour:"2-digit" }),
      temp: Math.round(it.main.temp),
      pop: Math.round((it.pop || 0)*100)
    }));
  }, [forecast]);

  return (
    <div className="glass p-4">
      <div className="mb-2 font-medium">Próximas horas</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="t" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="temp" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-sm text-slate-600">Probabilidade de chuva (%) aparece no tooltip.</div>
    </div>
  );
}
