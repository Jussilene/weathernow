// web/src/lib/moon.js
// 👉 Mantém suas funções existentes e acrescenta a conversão para a chave da imagem.
// Se você já tem moonPhase(date) e moonLabel, pode manter. Aqui vai a implementação completa.

export function moonPhase(date = new Date()) {
  // Algoritmo simples de fase da lua (0..1). 0 = nova, 0.5 = cheia.
  const lp = 2551443; // idade média do ciclo em segundos
  const new_moon = new Date(Date.UTC(2001, 0, 6, 18, 14, 0)); // referência
  const phase = ((date - new_moon) / 1000) % lp;
  return (phase / lp + 1) % 1;
}

export function moonLabel(phase) {
  // Opcional – rótulo amigável
  const k = phaseKey(phase);
  switch (k) {
    case "nova": return "Lua nova";
    case "crescente": return "Lua crescente";
    case "quarto.crescente": return "Quarto crescente";
    case "gibosa.crescente": return "Gibosa crescente";
    case "cheia": return "Lua cheia";
    case "gibosa.minguante": return "Gibosa minguante";
    case "quarto.minguante": return "Quarto minguante";
    case "minguante": return "Lua minguante";
    default: return "Lua";
  }
}

// Conversão numérica -> chave de fase (hemisfério sul)
// 0.00 nova | 0.125 crescente | 0.25 quarto crescente | 0.5 cheia
// 0.75 quarto minguante | 0.875 minguante
function phaseKey(p) {
  if (p < 0.03 || p > 0.97) return "nova";
  if (p < 0.22) return "crescente";
  if (p < 0.28) return "quarto.crescente";
  if (p < 0.47) return "gibosa.crescente";
  if (p < 0.53) return "cheia";
  if (p < 0.72) return "gibosa.minguante";
  if (p < 0.78) return "quarto.minguante";
  return "minguante";
}

export function phaseKeyFromDate(date = new Date()) {
  return phaseKey(moonPhase(date));
}
