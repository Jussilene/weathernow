// web/src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchWeatherByQuery, searchPlaces } from "./lib/api.js";
import "./styles.css";

/* ---------------- helpers ---------------- */
const fmtTemp = (t) => `${Math.round(t)}°`;
const fmtPct  = (n) => `${Math.round(n)}%`;
const kmh     = (n) => `${Math.round(n)} km/h`;
const km      = (n) => `${(n ?? 0).toFixed(1)} km`;
const hPa     = (n) => `${Math.round(n)} hPa`;

// ✅ corrige o base URL (sem usar new URL)
const BASE = import.meta.env.BASE_URL ?? "/";
const asset = (p) => BASE.replace(/\/$/, "") + "/" + p.replace(/^\//, "");

function fmtHM(ts) {
  if (!ts && ts !== 0) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function dayShort(ts) {
  return new Date(ts * 1000).toLocaleDateString("pt-BR", { weekday: "short" });
}
function dayDate(ts) {
  const d = new Date(ts * 1000);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

function moonPhaseText(p) {
  if (p === 0 || p === 1) return "Lua nova";
  if (p > 0 && p < 0.25) return "Crescente inicial";
  if (p === 0.25) return "Quarto crescente";
  if (p > 0.25 && p < 0.5) return "Gibosa crescente";
  if (p === 0.5) return "Lua cheia";
  if (p > 0.5 && p < 0.75) return "Gibosa minguante";
  if (p === 0.75) return "Quarto minguante";
  return "Minguante final";
}
function moonImageName(p) {
  if (p === 0 || p === 1) return "lua.nova.png";
  if (p > 0 && p < 0.25)   return "lua.crescente.png";
  if (p === 0.25)          return "lua.quarto.crescente.png";
  if (p > 0.25 && p < 0.5) return "lua.gibosa.crescente.png";
  if (p === 0.5)           return "lua.cheia.png";
  if (p > 0.5 && p < 0.75) return "lua.gibosa.minguante.png";
  if (p === 0.75)          return "lua.quarto.minguante.png";
  return "lua.minguante.png";
}

/* ---- tiny weather icons ---- */
function groupFromId(id) {
  const n = Number(id) || 800;
  if (n >= 200 && n < 300) return "thunder";
  if (n >= 300 && n < 400) return "drizzle";
  if (n >= 500 && n < 600) return "rain";
  if (n >= 600 && n < 700) return "snow";
  if (n >= 700 && n < 800) return "mist";
  if (n === 800) return "clear";
  return "clouds";
}
export function IconSmall({ id = 800, size = 34 }) {
  const g = groupFromId(id);
  const stroke = "#79A4C6";
  const fillSun = "#FFD34D";
  if (g === "clear") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="12" fill={fillSun} />
        {[...Array(8)].map((_, i) => {
          const a = (i * 360) / 8;
          return (
            <line
              key={i}
              x1="32" y1="6" x2="32" y2="0"
              stroke={fillSun} strokeWidth="4" strokeLinecap="round"
              transform={`rotate(${a} 32 32) translate(0 14)`}
            />
          );
        })}
      </svg>
    );
  }
  if (g === "rain" || g === "drizzle") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <g fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
          <path d="M18,34c0-7,6-12,12-12 4,0 7,2 9,5 1-1 3-2 5-2 5,0 9,4 9,9 0,6-5,10-11,10H22c-6,0-10-4-10-10 0-5 4-9 9-10" />
          <line x1="24" y1="48" x2="20" y2="56" />
          <line x1="36" y1="48" x2="32" y2="56" />
          <line x1="48" y1="48" x2="44" y2="56" />
        </g>
      </svg>
    );
  }
  if (g === "snow") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <g fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
          <path d="M18,34c0-7,6-12,12-12 4,0 7,2 9,5 1-1 3-2 5-2 5,0 9,4 9,9 0,6-5,10-11,10H22c-6,0-10-4-10-10 0-5 4-9 9-10" />
          {[22,32,42].map((x,i)=>(
            <g key={i} transform={`translate(${x} 50)`}>
              <line x1="-3" y1="0" x2="3" y2="0" stroke={stroke}/>
              <line x1="0" y1="-3" x2="0" y2="3" stroke={stroke}/>
            </g>
          ))}
        </g>
      </svg>
    );
  }
  if (g === "thunder") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <g fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
          <path d="M18,34c0-7,6-12,12-12 4,0 7,2 9,5 1-1 3-2 5-2 5,0 9,4 9,9 0,6-5,10-11,10H22c-6,0-10-4-10-10 0-5 4-9 9-10" />
        </g>
        <polygon points="38,40 30,52 37,52 32,60 45,44 38,44" fill="#F7B23B" />
      </svg>
    );
  }
  // clouds / mist
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
        <path d="M18,34c0-7,6-12,12-12 4,0 7,2 9,5 1-1 3-2 5-2 5,0 9,4 9,9 0,6-5,10-11,10H22c-6,0-10-4-10-10 0-5 4-9 9-10" />
      </g>
    </svg>
  );
}

/* ---- moon SVG fallback ---- */
function MoonSVG({ size = 74, phase = 0.5 }) {
  const r = size * 0.44;
  const frac = 1 - Math.abs(phase - 0.5) * 2;
  const dir = phase <= 0.5 ? 1 : -1;
  const dx = dir * (1 - frac) * r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <radialGradient id="mGrad" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#CFE3FF"/>
          <stop offset="100%" stopColor="#6AA9FF"/>
        </radialGradient>
        <mask id="mMask">
          <rect width="100" height="100" fill="black"/>
          <circle cx="50" cy="50" r={r} fill="white"/>
          <circle cx={50 + dx} cy="50" r={r} fill="black"/>
        </mask>
      </defs>
      <circle cx="50" cy="50" r={r} fill="url(#mGrad)"/>
      <circle cx="50" cy="50" r={r} fill="url(#mGrad)" mask="url(#mMask)"/>
    </svg>
  );
}

/* ---------------- App ---------------- */
export default function App() {
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [sug, setSug] = useState([]);

  // PWA install
  const [installEvt, setInstallEvt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallEvt(e); setShowInstall(true); };
    const onInstalled = () => { setInstallEvt(null); setShowInstall(false); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  async function onInstallClick() {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice;
    setInstallEvt(null); setShowInstall(false);
  }

  // moon img fallback
  const [moonImgOk, setMoonImgOk] = useState(true);
  useEffect(() => { setMoonImgOk(true); }, [data?.place?.name]);

  const placeLabel = useMemo(() => {
    if (!data?.place) return "";
    const { name, country } = data.place;
    return [name, country].filter(Boolean).join(", ");
  }, [data]);

  async function doSearch(e) {
    e?.preventDefault?.();
    setErr("");
    const term = q.trim();
    if (!term) return;
    setLoading(true);
    try {
      const r = await fetchWeatherByQuery(term);
      setData(r);
    } catch {
      setErr("Não foi possível carregar os dados.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // autocomplete — AGORA fora do header sticky
  useEffect(() => {
    const t = setTimeout(async () => {
      const term = q.trim();
      if (!term) return setSug([]);
      try { setSug(await searchPlaces(term)); }
      catch { setSug([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="wrap classic">
      {/* topo fixo */}
      <header className="top classic">
        <form className="search classic" onSubmit={doSearch}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Curitiba"
            aria-label="Buscar cidade"
          />
          <button className="btn classic" type="submit">Buscar</button>
          <span className="pin-dot" aria-hidden>📍</span>
        </form>
      </header>

      {/* sugestões NÃO sticky (fora do header) */}
      {!!sug.length && (
        <div className="sug classic nonsticky">
          {sug.slice(0, 6).map((s, i) => (
            <button key={i} onClick={() => { setQ(s.label); setSug([]); }}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {err && <div className="card error">{err}</div>}
      {loading && <div className="card">Carregando…</div>}

      {!loading && data && (
        <>
          {/* Cabeçalho grande */}
          <section className="card hero classic">
            <div className="left">
              <div className="place main">{placeLabel}</div>
              <div className="desc">{data.current.weather?.[0]?.description || "—"}</div>
            </div>
            <div className="right">
              <IconSmall id={data.current.weather?.[0]?.id} size={78} />
              <div className="bigtemp">{fmtTemp(data.current.temp)}</div>
              <div className="minmax">
                Máx {fmtTemp(data.daily?.[0]?.temp?.max)} · Min {fmtTemp(data.daily?.[0]?.temp?.min)}
              </div>
            </div>
          </section>

          {/* Métricas */}
          <section className="metrics-grid classic">
            <div className="metric card"><span className="label">Índice UV</span><span className="value">{data.current.uvi ?? "—"}</span></div>
            <div className="metric card"><span className="label">Umidade</span><span className="value">{fmtPct(data.current.humidity)}</span></div>
            <div className="metric card"><span className="label">Vento</span><span className="value">{kmh(data.current.wind_speed)}</span></div>
            <div className="metric card"><span className="label">Pressão</span><span className="value">{hPa(data.current.pressure)}</span></div>
            <div className="metric card"><span className="label">Visibilidade</span><span className="value">{km((data.current.visibility ?? 0) / 1000)}</span></div>
            <div className="metric card"><span className="label">Nascer do sol</span><span className="value">{fmtHM(data.current.sunrise)}</span></div>
            <div className="metric card"><span className="label">Pôr do sol</span><span className="value">{fmtHM(data.current.sunset)}</span></div>
            <div className="metric card">
              <span className="label">Fase da lua</span>
              <span className="value">{moonPhaseText(data.daily?.[0]?.moon_phase ?? 0)}</span>
            </div>
          </section>

          {/* Cartão da Lua */}
          {!!data.daily?.length && (
            <section className="card moon-card">
              <div className="moon-left">
                {moonImgOk ? (
                  <img
                    className="moon-img"
                    alt={moonPhaseText(data.daily[0].moon_phase)}
                    src={asset(`/moon/${moonImageName(data.daily[0].moon_phase)}`)}
                    onError={() => setMoonImgOk(false)}
                  />
                ) : (
                  <MoonSVG phase={data.daily[0].moon_phase} />
                )}
              </div>
              <div className="moon-right">
                <div className="moon-title">{moonPhaseText(data.daily[0].moon_phase)}</div>
                {(data.daily[0].moonrise || data.daily[0].moonset) && (
                  <div className="moon-times">
                    {data.daily[0].moonrise && <>Nascer {fmtHM(data.daily[0].moonrise)} • </>}
                    {data.daily[0].moonset && <>Pôr {fmtHM(data.daily[0].moonset)}</>}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Próximas horas */}
          {!!data.hourly?.length && (
            <section className="card hours classic">
              <div className="section-title">Próximas horas</div>
              <div className="hours-row">
                {data.hourly.slice(0, 8).map((h, i) => (
                  <div className="hour-col" key={i}>
                    <div className="h-time">
                      {new Date(h.dt * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit" })}
                    </div>
                    <IconSmall id={h.weather?.[0]?.id} size={32} />
                    <div className="h-temp">{fmtTemp(h.temp)}</div>
                    <div className="h-pop">{Math.round((h.pop || 0) * 100)}%</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Lista semanal */}
          {!!data.daily?.length && (
            <section className="card week classic">
              <div className="section-title">Na semana</div>
              <ul className="week-list">
                {data.daily.slice(0, 7).map((d, i) => (
                  <li key={i} className="week-item">
                    <div className="w-day">
                      <span className="w-dow">{dayShort(d.dt)},</span>
                      <span className="w-date">{dayDate(d.dt)}</span>
                    </div>
                    <div className="w-icon"><IconSmall id={d.weather?.[0]?.id} size={34} /></div>
                    <div className="w-temps">
                      <span className="w-min">{fmtTemp(d.temp.min)}</span>
                      <span className="w-max">{fmtTemp(d.temp.max)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* CTA instalar */}
      {showInstall && (
        <section className="card install-cta">
          <span>Instale o WeatherNow para acesso rápido na tela inicial.</span>
          <button className="btn classic" onClick={onInstallClick}>Instalar</button>
        </section>
      )}
    </div>
  );
}
