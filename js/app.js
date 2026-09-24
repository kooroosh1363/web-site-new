import { filterAndSort, getCategories } from "./catalog.js";
import { assertValidResources } from "./resource-schema.js";
import { loadBookmarks, loadTheme, saveBookmarks, saveTheme } from "./storage.js";
import { buildUrlSearch, parseUrlState } from "./url-state.js";

const elements = {
  search: document.querySelector("#search"),
  sort: document.querySelector("#sort"),
  categoryFilters: document.querySelector("#category-filters"),
  bookmarksFilter: document.querySelector("#bookmarks-filter"),
  bookmarkCount: document.querySelector("#bookmark-count"),
  clearFilters: document.querySelector("#clear-filters"),
  emptyClear: document.querySelector("#empty-clear"),
  retryLoad: document.querySelector("#retry-load"),
  resultCount: document.querySelector("#result-count"),
  resourceTotal: document.querySelector("#resource-total"),
  grid: document.querySelector("#resource-grid"),
  emptyState: document.querySelector("#empty-state"),
  errorState: document.querySelector("#error-state"),
  template: document.querySelector("#resource-card-template"),
  themeToggle: document.querySelector("#theme-toggle"),
  dialog: document.querySelector("#resource-dialog"),
  dialogContent: document.querySelector("#dialog-content"),
  dialogClose: document.querySelector(".dialog-close"),
  toast: document.querySelector("#toast"),
};

const initialUrlState = parseUrlState(window.location.search);
const state = {
  resources: [],
  ...initialUrlState,
  bookmarks: loadBookmarks(),
};

const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let toastTimer;

function setTheme(theme) {
  const resolved = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = resolved;
  elements.themeToggle.setAttribute("aria-pressed", String(resolved === "dark"));
  elements.themeToggle.setAttribute("aria-label", `Switch to ${resolved === "dark" ? "light" : "dark"} theme`);
  document.querySelector('meta[name="theme-color"]').content = resolved === "dark" ? "#1d2228" : "#f4efe4";
}

function initialTheme() {
  const stored = loadTheme();
  if (stored === "light" || stored === "dark") return stored;
  return systemTheme.matches ? "dark" : "light";
}

function syncControls() {
  elements.search.value = state.query;
  elements.sort.value = state.sort;
}

function syncUrl(mode = "replace") {
  const nextUrl = `${window.location.pathname}${buildUrlSearch(state)}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl === currentUrl) return;

  if (mode === "push") {
    window.history.pushState({}, "", nextUrl);
  } else {
    window.history.replaceState({}, "", nextUrl);
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 1800);
}

function renderCategories() {
  elements.categoryFilters.replaceChildren();
  const categories = getCategories(state.resources);

  if (!categories.includes(state.category)) {
    state.category = "All";
  }

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "filter-button";
    button.type = "button";
    button.textContent = category;
    button.dataset.category = category;
    button.setAttribute("aria-pressed", String(category === state.category));
    button.addEventListener("click", () => {
      state.category = category;
      render({ history: "push" });
    });
    elements.categoryFilters.append(button);
  });
}

function makeTag(label) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = label;
  return tag;
}

function toggleBookmark(resource) {
  const removing = state.bookmarks.has(resource.id);
  if (removing) state.bookmarks.delete(resource.id);
  else state.bookmarks.add(resource.id);

  saveBookmarks(state.bookmarks);
  showToast(removing ? `${resource.title} removed from saved` : `${resource.title} saved`);
  render({ history: false });
}

function openDetails(resource) {
  elements.dialogContent.replaceChildren();

  const category = document.createElement("p");
  category.className = "dialog-category";
  category.textContent = `${resource.category} / ${resource.type}`;

  const title = document.createElement("h2");
  title.id = "dialog-title";
  title.textContent = resource.title;

  const description = document.createElement("p");
  description.className = "dialog-description";
  description.textContent = resource.description;

  const note = document.createElement("p");
  note.className = "dialog-note";
  note.textContent = resource.note;

  const tags = document.createElement("div");
  tags.className = "tag-list";
  resource.tags.forEach((item) => tags.append(makeTag(item)));

  const link = document.createElement("a");
  link.className = "dialog-link";
  link.href = resource.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Visit resource ↗";

  elements.dialogContent.append(category, title, description, note, tags, link);
  elements.dialog.showModal();
}

function makeCard(resource, position) {
  const card = elements.template.content.firstElementChild.cloneNode(true);
  const saved = state.bookmarks.has(resource.id);

  card.querySelector(".resource-card__index").textContent = String(position + 1).padStart(2, "0");
  card.querySelector(".resource-card__category").textContent = resource.category;
  card.querySelector(".resource-card__title").textContent = resource.title;
  card.querySelector(".resource-card__description").textContent = resource.description;
  card.querySelector(".resource-card__type").textContent = resource.type;

  const bookmark = card.querySelector(".bookmark-button");
  bookmark.setAttribute("aria-pressed", String(saved));
  bookmark.querySelector("span").textContent = `${saved ? "Remove" : "Save"} ${resource.title}`;
  bookmark.addEventListener("click", () => toggleBookmark(resource));

  const body = card.querySelector(".resource-card__body");
  body.setAttribute("aria-label", `View details for ${resource.title}`);
  body.addEventListener("click", () => openDetails(resource));

  const tags = card.querySelector(".tag-list");
  resource.tags.slice(0, 3).forEach((item) => tags.append(makeTag(item)));

  return card;
}

function render({ history = "replace" } = {}) {
  const results = filterAndSort(state.resources, state);

  elements.grid.replaceChildren(...results.map(makeCard));
  elements.grid.hidden = results.length === 0;
  elements.grid.setAttribute("aria-busy", "false");
  elements.emptyState.hidden = results.length !== 0;
  elements.errorState.hidden = true;

  const noun = results.length === 1 ? "resource" : "resources";
  elements.resultCount.textContent = `${results.length} ${noun} in view`;
  elements.bookmarkCount.textContent = state.bookmarks.size;
  elements.bookmarksFilter.setAttribute("aria-pressed", String(state.savedOnly));
  elements.clearFilters.hidden =
    !state.query &&
    state.category === "All" &&
    state.sort === "featured" &&
    !state.savedOnly;

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === state.category));
  });

  syncControls();
  if (history) syncUrl(history);
}

function resetFilters() {
  state.query = "";
  state.category = "All";
  state.sort = "featured";
  state.savedOnly = false;
  render({ history: "push" });
}

function restoreUrlState() {
  const restored = parseUrlState(window.location.search);
  state.query = restored.query;
  state.category = restored.category;
  state.sort = restored.sort;
  state.savedOnly = restored.savedOnly;

  const categories = getCategories(state.resources);
  if (!categories.includes(state.category)) state.category = "All";

  render({ history: false });
}

async function loadResources() {
  elements.grid.setAttribute("aria-busy", "true");
  elements.errorState.hidden = true;

  try {
    const response = await fetch("data/resources.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);

    const resources = assertValidResources(await response.json());
    state.resources = resources;
    elements.resourceTotal.textContent = `${resources.length} resources / locally curated`;

    renderCategories();
    render({ history: "replace" });
  } catch (error) {
    console.error(error);
    elements.grid.hidden = true;
    elements.emptyState.hidden = true;
    elements.errorState.hidden = false;
    elements.resultCount.textContent = "Catalog unavailable";
    elements.grid.setAttribute("aria-busy", "false");
  }
}

syncControls();
setTheme(initialTheme());

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  render({ history: "replace" });
});

elements.sort.addEventListener("change", (event) => {
  state.sort = event.target.value;
  render({ history: "push" });
});

elements.bookmarksFilter.addEventListener("click", () => {
  state.savedOnly = !state.savedOnly;
  render({ history: "push" });
});

elements.themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
  saveTheme(next);
});

systemTheme.addEventListener("change", (event) => {
  if (loadTheme() === null) {
    setTheme(event.matches ? "dark" : "light");
  }
});

elements.clearFilters.addEventListener("click", resetFilters);
elements.emptyClear.addEventListener("click", resetFilters);
elements.retryLoad.addEventListener("click", loadResources);
elements.dialogClose.addEventListener("click", () => elements.dialog.close());
elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});

window.addEventListener("popstate", restoreUrlState);

document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    elements.search.focus();
  }
});

loadResources();
