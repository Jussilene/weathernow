import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function HourlyChart({ items = [] }){
  return (
    <section className="glass p-lg">
      <h3 className="section-sub">Próximas horas</h3>

      <div className="hour-row">
        {items.map((h,i)=>(
          <div className="hour" key={i}>
            <div className="hour-time">{h.hour}</div>
            <img className="hour-icon" src={`https://openweathermap.org/img/wn/${h.icon}.png`} alt=""/>
            <div className="hour-temp">{h.temp}°</div>
          </div>
        ))}
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={items}>
            <XAxis dataKey="hour" />
            <YAxis domain={["auto","auto"]} />
            <Tooltip />
            <Line type="monotone" dataKey="temp" strokeWidth={3} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
