export function hashSeed(seed) {
  const text = String(seed || "BINGO-GREGO");
  let h = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    h ^= text.charCodeAt(index);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createRng(seed) {
  let state = hashSeed(seed) || 1;
  return function rng() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(items, rng = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function pickBalanced(pool, amount, usage, rng) {
  const available = [...pool];
  const picked = [];
  while (picked.length < amount && available.length) {
    const weights = available.map((item) => 1 / (1 + (usage.get(item.letter) || 0) * 1.8));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let cursor = rng() * total;
    let selectedIndex = 0;
    for (let index = 0; index < weights.length; index += 1) {
      cursor -= weights[index];
      if (cursor <= 0) {
        selectedIndex = index;
        break;
      }
    }
    const [selected] = available.splice(selectedIndex, 1);
    picked.push(selected);
    usage.set(selected.letter, (usage.get(selected.letter) || 0) + 1);
  }
  return picked;
}
