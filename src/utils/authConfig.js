const AUTH_KEY = "github-widget-auth";

function cleanUsername(value) {
  return String(value || "").trim().replace(/^@/, "");
}

function cleanToken(value) {
  return String(value || "").trim();
}

export function getAuthDefaults() {
  return {
    username: cleanUsername(import.meta.env.VITE_GITHUB_USERNAME),
    token: "",
  };
}

export function loadAuthConfig() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const username = cleanUsername(parsed.username);
    const token = cleanToken(parsed.token);

    return username && token ? { username, token } : null;
  } catch (_) {
    return null;
  }
}

export function saveAuthConfig(config) {
  const auth = {
    username: cleanUsername(config.username),
    token: cleanToken(config.token),
  };

  if (!auth.username || !auth.token) {
    throw new Error("GitHub username and token are required");
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  return auth;
}

export function clearAuthConfig() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (_) {}
}
