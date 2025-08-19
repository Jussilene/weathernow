import React from "react";

export default function CurrentCard({ city, temp, desc, hi, lo, iconUrl, isNight }){
  return (
    <section className="current glass">
      <div className="current-left">
        <div className="city">{city}</div>
        <div className="temp">{temp}°</div>
        <div className="desc">{desc}</div>
        <div className="hi-lo">
          <span>↑ {hi}°</span>
          <span>↓ {lo}°</span>
        </div>
      </div>
      <div className="current-right">
        {iconUrl ? <img src={iconUrl} alt="" className="wicon"/> : null}
      </div>
    </section>
  );
}
