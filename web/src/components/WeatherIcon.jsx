import React from "react";
import { getIconUrl } from "../lib/icons";

export default function WeatherIcon({ tipo, size = 128, alt = "" }) {
  const src = getIconUrl(tipo, size) || getIconUrl(tipo, 192);
  if (!src) return null;
  return <img src={src} width={size} height={size} alt={alt} className="select-none" />;
}
