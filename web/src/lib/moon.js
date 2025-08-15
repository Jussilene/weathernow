// [web/src/lib/moon.js] — cálculo simples da fase da lua (0..1)
export function moonPhase(date = new Date()) {
  const lp = 2551443; // período sinódico em segundos
  const new_moon = new Date(Date.UTC(2000, 0, 6, 18, 14)); // referência
  const phase = ((date - new_moon) / 1000) % lp;
  const frac = phase / lp; // 0 nova, 0.5 cheia
  return frac;
}
export function moonLabel(frac) {
  const names = [
    "Lua nova","Crescente inicial","Quarto crescente",
    "Gibosa crescente","Lua cheia","Gibosa minguante",
    "Quarto minguante","Minguante final"
  ];
  const idx = Math.round(frac*8) % 8;
  return names[idx];
}
