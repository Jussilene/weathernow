import React, { useMemo } from "react";

function groupByDay(list, tz){
  const map = new Map();
  for (const item of list){
    const d = new Date((item.dt + tz) * 1000);
    const key = d.toISOString().slice(0,10);
    const arr = map.get(key) || [];
    arr.push(item);
    map.set(key, arr);
  }
  return [...map.entries()].slice(0,7);
}

export default function DailyList({ list = [], tz = 0 }){
  const days = useMemo(()=>groupByDay(list, tz), [list, tz]);
  const label = (iso) => {
    const d = new Date(iso+"T00:00:00Z");
    return d.toLocaleDateString([], { weekday:"short" });
  };

  return (
    <section className="glass p-lg">
      <h3 className="section-sub">Próximos dias</h3>
      <div className="daily-list">
        {days.map(([iso, items])=>{
          const tmax = Math.round(Math.max(...items.map(i=>i.main?.temp_max ?? 0)));
          const tmin = Math.round(Math.min(...items.map(i=>i.main?.temp_min ?? 0)));
          const icon = items?.[0]?.weather?.[0]?.icon ?? "01d";
          return (
            <div className="daily" key={iso}>
              <div className="d-col">{label(iso)}</div>
              <div className="d-col">
                <img src={`https://openweathermap.org/img/wn/${icon}.png`} alt=""/>
              </div>
              <div className="d-col">
                <span className="tmax">{tmax}°</span>
                <span className="tmin">{tmin}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
