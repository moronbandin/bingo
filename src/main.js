import { ALL_LETTERS } from "./alphabet.js";
import { alphabetByCase, createCallerState, drawNext, findLetter, resetCaller, saveCaller } from "./caller.js";
import { generateCards } from "./cards.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const defaultSettings = {
  cardCount: 10,
  seed: `GREGO-${new Date().getFullYear()}`,
  showNames: false,
  cardNumbers: true,
};

let callerState = createCallerState();
let settings = loadSettings();

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem("bingo-grego-settings") || "{}");
    return sanitizeSettings({ ...defaultSettings, ...stored });
  } catch {
    return sanitizeSettings({ ...defaultSettings });
  }
}

function saveSettings() {
  localStorage.setItem("bingo-grego-settings", JSON.stringify(settings));
}

function sanitizeSettings(nextSettings) {
  return {
    ...defaultSettings,
    ...nextSettings,
    cardCount: normalizeCardCount(nextSettings.cardCount),
  };
}

function syncControls() {
  $$("[data-setting]").forEach((control) => {
    const key = control.dataset.setting;
    if (control.type === "checkbox") {
      control.checked = Boolean(settings[key]);
    } else {
      control.value = settings[key];
    }
  });
}

function normalizeCardCount(value) {
  const parsed = Number.parseInt(value, 10);
  const bounded = Math.max(10, Number.isFinite(parsed) ? parsed : defaultSettings.cardCount);
  return Math.ceil(bounded / 10) * 10;
}

function setView(viewName) {
  $$("[data-view]").forEach((view) => view.classList.toggle("is-active", view.dataset.view === viewName));
  $$("[data-view-button]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewButton === viewName);
  });
}

function renderCaller() {
  const drawnSet = new Set(callerState.drawn);
  const last = callerState.last ? findLetter(callerState.last) : null;
  const drawnCount = callerState.drawn.length;
  const remaining = callerState.remaining.length;

  $("[data-remaining-count]").textContent = remaining;
  $("[data-drawn-count]").textContent = `${drawnCount} saídas`;
  $("[data-progress-bar]").style.width = `${(drawnCount / ALL_LETTERS.length) * 100}%`;

  if (last) {
    $("[data-draw-label]").textContent = last.case === "upper" ? "Última: maiúscula" : "Última: minúscula";
    $("[data-last-letter]").textContent = last.letter;
    $("[data-last-name]").textContent = last.name;
  } else {
    $("[data-draw-label]").textContent = "Preme sacar letra";
    $("[data-last-letter]").textContent = "Α";
    $("[data-last-name]").textContent = "Maiúsculas e minúsculas mesturadas";
  }

  ["upper", "lower"].forEach((caseName) => {
    const board = $(`[data-board="${caseName}"]`);
    board.innerHTML = alphabetByCase(caseName)
      .map((item) => {
        const drawn = drawnSet.has(item.letter);
        return `<span class="letter-chip ${drawn ? "is-drawn" : ""}" title="${item.name}">${item.letter}</span>`;
      })
      .join("");
  });

  const history = $("[data-history-list]");
  history.innerHTML = callerState.drawn
    .slice()
    .reverse()
    .map((letter, index) => {
      const item = findLetter(letter);
      return `<li><span>${callerState.drawn.length - index}</span><strong>${letter}</strong><em>${item?.name || ""}</em></li>`;
    })
    .join("");

  saveCaller(callerState);
}

function renderCards() {
  settings = sanitizeSettings(settings);
  syncControls();
  saveSettings();
  const cards = generateCards(settings);
  const preview = $("[data-cards-preview]");
  preview.dataset.format = "classic";
  document.body.dataset.cardFormat = "classic";
  document.body.classList.toggle("hide-letter-names", !settings.showNames);
  preview.innerHTML = renderSheets(cards);

  const pages = Math.ceil(settings.cardCount / 10);
  $("[data-preview-summary]").textContent = `${settings.cardCount} cartóns · ${pages} ${pages === 1 ? "folio" : "folios"} A4`;
  $("[data-stat='letterPool']").textContent = "48";
  $("[data-stat='cardCount']").textContent = String(settings.cardCount);
  $("[data-stat='pageCount']").textContent = String(pages);
  $("[data-stat='seed']").textContent = settings.seed || "—";
}

function renderSheets(cards) {
  const sheets = [];
  for (let index = 0; index < cards.length; index += 10) {
    const sheetCards = cards.slice(index, index + 10);
    const pageNumber = index / 10 + 1;
    sheets.push(`
      <section class="print-sheet" aria-label="Folio ${pageNumber}">
        ${sheetCards.map(renderCard).join("")}
      </section>
    `);
  }
  return sheets.join("");
}

function renderCard(card) {
  const title = settings.cardNumbers ? `Cartón ${String(card.id).padStart(2, "0")}` : "Bingo grego";
  const cells = card.cells
    .map((row) =>
      row
        .map((cell) => {
          if (!cell) return `<div class="card-cell is-empty"></div>`;
          return `<div class="card-cell"><strong>${cell.letter}</strong>${settings.showNames ? `<small>${cell.name}</small>` : ""}</div>`;
        })
        .join(""),
    )
    .join("");

  return `
    <article class="bingo-card" data-format="${card.format}" style="--card-cols:${card.spec.cols}">
      <header>
        <span>${title}</span>
        <strong>bingo</strong>
        <span>${settings.seed}</span>
      </header>
      <div class="card-grid">${cells}</div>
    </article>
  `;
}

function updateSetting(control) {
  const key = control.dataset.setting;
  if (control.type === "checkbox") {
    settings[key] = control.checked;
  } else if (key === "cardCount") {
    settings[key] = Math.min(300, normalizeCardCount(control.value));
    control.value = settings[key];
  } else {
    settings[key] = control.value;
  }
  saveSettings();
  renderCards();
}

function randomSeed() {
  const chunk = Math.random().toString(36).slice(2, 7).toUpperCase();
  settings.seed = `GREGO-${chunk}`;
  syncControls();
  saveSettings();
  renderCards();
}

function bindEvents() {
  $$("[data-view-button]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewButton));
  });

  $("[data-action='draw']").addEventListener("click", () => {
    callerState = drawNext(callerState);
    renderCaller();
  });

  $("[data-action='reset-caller']").addEventListener("click", () => {
    callerState = resetCaller();
    renderCaller();
  });

  $("[data-action='fullscreen']").addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  $("[data-action='random-seed']").addEventListener("click", randomSeed);
  $("[data-action='print']").addEventListener("click", () => window.print());

  $$("[data-setting]").forEach((control) => {
    control.addEventListener("input", () => updateSetting(control));
    control.addEventListener("change", () => updateSetting(control));
  });

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && $("#caller-view").classList.contains("is-active")) {
      event.preventDefault();
      callerState = drawNext(callerState);
      renderCaller();
    }
  });
}

syncControls();
bindEvents();
renderCaller();
renderCards();
