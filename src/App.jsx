import { useEffect, useState } from "react";
import ContributionGraph from "./components/ContributionGraph";
import Onboarding from "./components/Onboarding";
import { clearAuthConfig, loadAuthConfig } from "./utils/authConfig";
import { applyTheme, loadTheme } from "./utils/themeConfig";
import "./App.css";

export default function App() {
  const [auth, setAuth] = useState(loadAuthConfig);

  useEffect(() => {
    applyTheme(loadTheme());
  }, []);

  const logout = () => {
    clearAuthConfig();
    try { localStorage.removeItem("github-widget-competitors"); } catch (_) {}
    setAuth(null);
  };

  if (!auth) {
    return <Onboarding onComplete={setAuth} />;
  }

  return <ContributionGraph auth={auth} onLogout={logout} />;
}
