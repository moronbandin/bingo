import { ALL_LETTERS, LOWER, UPPER } from "./alphabet.js";
import { shuffle } from "./random.js";

const STORAGE_KEY = "bingo-grego-caller";

export function createCallerState() {
  const saved = loadCaller();
  if (saved) return saved;
  return resetCaller();
}

export function resetCaller() {
  return {
    remaining: shuffle(ALL_LETTERS).map((item) => item.letter),
    drawn: [],
    last: null,
  };
}

export function drawNext(state) {
  if (!state.remaining.length) return state;
  const [letter, ...remaining] = state.remaining;
  return {
    remaining,
    drawn: [...state.drawn, letter],
    last: letter,
  };
}

export function saveCaller(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadCaller() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed || !Array.isArray(parsed.remaining) || !Array.isArray(parsed.drawn)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function findLetter(letter) {
  return ALL_LETTERS.find((item) => item.letter === letter);
}

export function alphabetByCase(caseName) {
  return caseName === "upper" ? UPPER : LOWER;
}
