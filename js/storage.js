const BOOKMARK_KEY = "curio.bookmarks";
const THEME_KEY = "curio.theme";

function safeRead(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The app remains usable when storage is disabled.
  }
}

export function loadBookmarks() {
  const bookmarks = safeRead(BOOKMARK_KEY, []);
  return new Set(Array.isArray(bookmarks) ? bookmarks : []);
}

export function saveBookmarks(bookmarks) {
  safeWrite(BOOKMARK_KEY, [...bookmarks]);
}

export function loadTheme() {
  return safeRead(THEME_KEY, null);
}

export function saveTheme(theme) {
  safeWrite(THEME_KEY, theme);
}
