const THEME_KEY = "github-widget-theme";

export const THEMES = [
  { id: "green", label: "Green theme" },
  { id: "blue", label: "Blue theme" },
];

export const DEFAULT_THEME = "blue";

export function normalizeTheme(theme) {
  return THEMES.some(({ id }) => id === theme) ? theme : DEFAULT_THEME;
}

export function loadTheme() {
  try {
    return normalizeTheme(localStorage.getItem(THEME_KEY));
  } catch (_) {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = normalizeTheme(theme);
}

export function saveTheme(theme) {
  const nextTheme = normalizeTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, nextTheme);
  } catch (_) {}
  applyTheme(nextTheme);
  return nextTheme;
}
