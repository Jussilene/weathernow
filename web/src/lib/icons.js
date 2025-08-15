// mapeia nossas imagens geradas — usando import.meta.glob para obter a URL final do Vite
// estrutura esperada: src/assets/icons/<tipo>/<tipo>-icon-<size>.png
// tipos: sol | nuvem | chuva | lua

// carrega TODAS como URL (eager) e organiza por tipo/tamanho
const allIcons = import.meta.glob("../assets/icons/*/*-icon-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const registry = {}; // { tipo: {size: url} }
for (const [path, url] of Object.entries(allIcons)) {
  // ex: ../assets/icons/sol/sol-icon-192.png
  const parts = path.split("/");
  const tipo = parts[parts.length - 2];                // sol | nuvem | chuva | lua
  const file = parts[parts.length - 1];                // sol-icon-192.png
  const size = Number((file.match(/(\d+)\.png$/) || [])[1]); // 72..512
  if (!registry[tipo]) registry[tipo] = {};
  registry[tipo][size] = url;
}

// pega a melhor URL pro tamanho desejado; se não achar, cai para 192, depois 128
export function getIconUrl(tipo, size = 192) {
  const table = registry[tipo] || {};
  if (table[size]) return table[size];
  if (table[192]) return table[192];
  if (table[128]) return table[128];
  // último recurso: qualquer primeiro
  const any = Object.values(table)[0];
  return any || "";
}

// converte código do OpenWeather + dia/noite em um de nossos tipos
// refs: 2xx trovoada; 3xx garoa; 5xx chuva; 6xx neve; 7xx atmosfera; 800 limpo; 801-804 nuvens
export function mapWeatherToTipo(code, isNight) {
  // limpo
  if (code === 800) return isNight ? "lua" : "sol";

  // poucas nuvens → tratar como “limpo” de dia (sol) e “lua” à noite
  if (code === 801) return isNight ? "lua" : "sol";

  // nuvens (scattered/broken/overcast)
  if (code === 802 || code === 803 || code === 804) return "nuvem";

  // trovoada/garoa/chuva
  if ((code >= 200 && code < 300) || (code >= 300 && code < 400) || (code >= 500 && code < 600)) {
    return "chuva";
  }

  // neve e fenômenos (neblina/poeira)
  if ((code >= 600 && code < 700) || (code >= 700 && code < 800)) return "nuvem";

  // fallback seguro
  return isNight ? "lua" : "nuvem";
}
