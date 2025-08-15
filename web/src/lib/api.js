// [web/src/lib/api.js]
const SERVER = import.meta.env.VITE_PROXY_URL || "http://localhost:5179";

export async function getByCoords(lat, lon) {
  const [current, forecast] = await Promise.all([
    fetch(`${SERVER}/api/weather/current?lat=${lat}&lon=${lon}`).then(r=>r.json()),
    fetch(`${SERVER}/api/weather/forecast?lat=${lat}&lon=${lon}`).then(r=>r.json())
  ]);
  return { current, forecast };
}

export async function getByCity(q) {
  const [current, forecast] = await Promise.all([
    fetch(`${SERVER}/api/weather/current?q=${encodeURIComponent(q)}`).then(r=>r.json()),
    fetch(`${SERVER}/api/weather/forecast?q=${encodeURIComponent(q)}`).then(r=>r.json())
  ]);
  return { current, forecast };
}
