import { useState } from "react";
import { getAuthDefaults, saveAuthConfig } from "../utils/authConfig";

export default function Onboarding({ onComplete }) {
  const defaults = getAuthDefaults();
  const [username, setUsername] = useState(defaults.username);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const canContinue = username.trim() && token.trim();

  const submit = (event) => {
    event.preventDefault();
    if (!canContinue) return;

    try {
      const auth = saveAuthConfig({ username, token });
      onComplete(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="widget-shell onboarding-shell">
      <form className="widget onboarding-panel" onSubmit={submit}>
        <span className="onboarding-title">Setup</span>

        <label className="onboarding-field">
          <span>VITE_GITHUB_USERNAME</span>
          <input
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setError("");
            }}
            placeholder="github username"
            spellCheck={false}
            autoFocus
          />
        </label>

        <label className="onboarding-field">
          <span>VITE_GITHUB_TOKEN</span>
          <input
            type="password"
            value={token}
            onChange={(event) => {
              setToken(event.target.value);
              setError("");
            }}
            placeholder="github token"
            spellCheck={false}
          />
        </label>

        {error && <span className="onboarding-error">{error}</span>}

        <button className="onboarding-continue" type="submit" disabled={!canContinue}>
          Continue
        </button>
      </form>
    </div>
  );
}
