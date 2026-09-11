import { getPool } from "./alphabet.js";
import { createRng, pickBalanced, shuffle } from "./random.js";

export const FORMATS = {
  classic: { rows: 3, cols: 9, filled: 15, label: "Clásico 3x9" },
};

function makeClassicMask(rng) {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const colCounts = Array.from({ length: 9 }, () => 1);
    let remaining = 6;
    while (remaining > 0) {
      const candidates = colCounts.map((count, index) => (count < 3 ? index : null)).filter((index) => index !== null);
      const index = candidates[Math.floor(rng() * candidates.length)];
      colCounts[index] += 1;
      remaining -= 1;
    }

    const grid = Array.from({ length: 3 }, () => Array.from({ length: 9 }, () => false));
    const rowCounts = [0, 0, 0];
    const columns = shuffle([...Array(9).keys()], rng);
    let valid = true;

    for (const col of columns) {
      const possibleRows = shuffle([0, 1, 2], rng)
        .filter((row) => rowCounts[row] < 5)
        .sort((a, b) => rowCounts[a] - rowCounts[b]);
      if (possibleRows.length < colCounts[col]) {
        valid = false;
        break;
      }
      possibleRows.slice(0, colCounts[col]).forEach((row) => {
        grid[row][col] = true;
        rowCounts[row] += 1;
      });
    }

    if (valid && rowCounts.every((count) => count === 5)) return grid;
  }
  throw new Error("Non foi posibel crear unha mascara de carton clasico.");
}

function makeMask(format, rng) {
  return makeClassicMask(rng);
}

export function generateCards(settings) {
  const rng = createRng(`${settings.seed}-${settings.cardCount}-classic-mixed`);
  const spec = FORMATS.classic;
  const pool = getPool("mixed");
  const usage = new Map();
  const cards = [];

  for (let cardIndex = 0; cardIndex < settings.cardCount; cardIndex += 1) {
    const mask = makeMask(settings.format, rng);
    const letters = shuffle(pickBalanced(pool, spec.filled, usage, rng), rng);
    let cursor = 0;
    const cells = mask.map((row, rowIndex) =>
      row.map((filled, colIndex) => {
        if (!filled) return null;
        const value = letters[cursor];
        cursor += 1;
        return value;
      }),
    );

    cards.push({ id: cardIndex + 1, format: "classic", spec, cells });
  }

  return cards;
}
