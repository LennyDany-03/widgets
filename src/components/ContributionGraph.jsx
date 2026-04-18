import { useState } from "react";
import CompetitorMenu from "./CompetitorMenu";
import SettingsMenu from "./SettingsMenu";
import ContributionCell from "./ContributionCell";
import MonthLabels from "./MonthLabels";
import DayLabels from "./DayLabels";
import { padWeeks } from "../utils/contributionUtils";
import useGithubContributions from "../hooks/useGithubContributions";
import { useEffect, useRef } from "react";

/* ── localStorage ── */
const COMP_KEY = "github-widget-competitors";
const loadCompetitors = () => {
  try { return JSON.parse(localStorage.getItem(COMP_KEY) || "[]"); } catch { return []; }
};
const saveCompetitors = (list) => {
  try { localStorage.setItem(COMP_KEY, JSON.stringify(list)); } catch {}
};

/* ── Shared graph grid ── */
function GraphGrid({ weeks }) {
  const padded    = padWeeks(weeks);
  const totalCols = padded.length;
  return (
    <div className="graph-wrapper">
      <DayLabels />
      <div className="graph-area">
        <MonthLabels weeks={padded} />
        <div className="grid">
          {padded.map((week, wi) => (
            <div key={wi} className="week-col">
              {week.map((day, di) => (
                <ContributionCell key={di} day={day} col={wi} row={di} totalCols={totalCols} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/*
  CompetitorView — own component so the hook is called unconditionally within it.
  Reports loaded data back to parent via onDataLoaded so the shared header can display it.
*/
function CompetitorView({ username, onSave, onDataLoaded }) {
  const { weeks, totalContributions, streak, avatarUrl, loading, error } =
    useGithubContributions(username);

  useEffect(() => {
    if (!loading && !error && avatarUrl) {
      onDataLoaded({ totalContributions, streak, avatarUrl });
      onSave(username, avatarUrl);
    }
  }, [loading, error, avatarUrl]);

  if (loading) return <div className="status">Fetching @{username}…</div>;
  if (error)   return (
    <div className="comp-error-panel">
      <span className="status error">User "{username}" not found</span>
    </div>
  );
  return <GraphGrid weeks={weeks} />;
}

/* ── Search panel ── */
function SearchPanel({ onExplore, onCancel }) {
  const [value, setValue] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    const v = value.trim().replace(/^@/, "");
    if (v) onExplore(v);
  };

  return (
    <div className="search-panel">
      <p className="search-hint">Enter a GitHub username to compare</p>
      <div className="search-row">
        <div className="search-field">
          <span className="search-at">@</span>
          <input
            ref={ref}
            className="search-input"
            placeholder="username"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            spellCheck={false}
          />
        </div>
        <button className="search-btn" onClick={submit} disabled={!value.trim()}>
          Explore
        </button>
      </div>
      <button className="search-cancel" onClick={onCancel}>Cancel</button>
    </div>
  );
}

/* ── Icons ── */
const GitHubIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="#3d444d">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

const BackIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/>
  </svg>
);

/* ── Main component ── */
export default function ContributionGraph() {
  const ownUsername = import.meta.env.VITE_GITHUB_USERNAME;
  const { weeks, totalContributions, streak, avatarUrl, loading, error } =
    useGithubContributions();

  const [competitors,       setCompetitors]  = useState(loadCompetitors);
  const [viewMode,          setViewMode]     = useState("own");
  const [competitorName,    setCompName]     = useState(null);
  const [competitorData,    setCompData]     = useState(null); // loaded from CompetitorView

  const backToOwn = () => { setViewMode("own"); setCompName(null); setCompData(null); };

  const viewCompetitor = (username) => {
    if (!username) { backToOwn(); return; }
    setCompData(null);
    setCompName(username);
    setViewMode("competitor");
  };

  const addCompetitor = (username, url) => {
    setCompetitors(prev => {
      if (prev.find(c => c.username === username)) return prev;
      const next = [...prev, { username, avatarUrl: url }];
      saveCompetitors(next);
      return next;
    });
  };

  const isComp = viewMode === "competitor";

  /* ── Header left — switches between own and competitor info ── */
  const HeaderLeft = () => isComp ? (
    <div className="header-left">
      <button className="back-btn" onClick={backToOwn} title="Back to your graph">
        <BackIcon />
      </button>
      {competitorData?.avatarUrl
        ? <img src={competitorData.avatarUrl} className="avatar avatar-comp" alt="" draggable="false" />
        : <div className="avatar avatar-skeleton" />
      }
      <div className="user-info">
        <span className="username">@{competitorName}</span>
        <span className="sub comp-sub">
          {competitorData
            ? `${competitorData.totalContributions.toLocaleString()} contributions${competitorData.streak > 0 ? ` · 🔥${competitorData.streak}` : ""}`
            : "Loading…"}
        </span>
      </div>
    </div>
  ) : (
    <div className="header-left">
      {avatarUrl
        ? <img src={avatarUrl} className="avatar" alt="" draggable="false" />
        : <div className="avatar-placeholder"><GitHubIcon /></div>
      }
      <div className="user-info">
        <span className="username">@{ownUsername}</span>
        <span className="sub">
          {loading ? "Loading…" : error ? "Error" : `${totalContributions.toLocaleString()} contributions this year`}
        </span>
      </div>
    </div>
  );

  return (
    <div className="widget-shell">
      <div className={`widget${isComp ? " widget-comp" : ""}`}>

        <div className="header">
          <HeaderLeft />
          <div className="header-right">
            {!isComp && !loading && !error && streak > 0 && (
              <div className="streak-badge">
                <span className="streak-flame">🔥</span>
                <div className="streak-info">
                  <span className="streak-count">{streak}</span>
                  <span className="streak-label">day streak</span>
                </div>
              </div>
            )}
            <CompetitorMenu
              competitors={competitors}
              activeUsername={isComp ? competitorName : null}
              onSelect={viewCompetitor}
              onAddNew={() => setViewMode("searching")}
            />
            <SettingsMenu />
          </div>
        </div>

        {/* ── Divider when in competitor mode ── */}
        {isComp && <div className="comp-divider-line" />}

        {/* ── Content ── */}
        {viewMode === "own" && (
          loading ? <div className="status">Fetching contributions…</div>
          : error ? <div className="status error">{error}</div>
          : <GraphGrid weeks={weeks} />
        )}

        {viewMode === "searching" && (
          <SearchPanel onExplore={viewCompetitor} onCancel={backToOwn} />
        )}

        {viewMode === "competitor" && competitorName && (
          <CompetitorView
            key={competitorName}
            username={competitorName}
            onSave={addCompetitor}
            onDataLoaded={setCompData}
          />
        )}

      </div>
    </div>
  );
}
