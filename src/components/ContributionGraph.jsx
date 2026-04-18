import SettingsMenu from "./SettingsMenu";
import ContributionCell from "./ContributionCell";
import MonthLabels from "./MonthLabels";
import DayLabels from "./DayLabels";
import { padWeeks } from "../utils/contributionUtils";
import useGithubContributions from "../hooks/useGithubContributions";

const GitHubIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="#3d444d">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

export default function ContributionGraph() {
  const { weeks, totalContributions, streak, avatarUrl, loading, error } =
    useGithubContributions();

  const username = import.meta.env.VITE_GITHUB_USERNAME;

  if (loading) {
    return (
      <div className="widget-shell">
        <div className="widget">
          <div className="status">Fetching contributions…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-shell">
        <div className="widget">
          <div className="status error">{error}</div>
        </div>
      </div>
    );
  }

  const paddedWeeks = padWeeks(weeks);
  const totalCols   = paddedWeeks.length;

  return (
    <div className="widget-shell">
      <div className="widget">

        <div className="header">
          <div className="header-left">
            {avatarUrl
              ? <img src={avatarUrl} className="avatar" alt="" draggable="false" />
              : <div className="avatar-placeholder"><GitHubIcon /></div>
            }
            <div className="user-info">
              <span className="username">@{username}</span>
              <span className="sub">{totalContributions.toLocaleString()} contributions this year</span>
            </div>
          </div>

          <div className="header-right">
            {streak > 0 && (
              <div className="streak-badge">
                <span className="streak-fire">🔥</span>
                <span className="streak-count">{streak}</span>
                <span className="streak-label">day streak</span>
              </div>
            )}
            <SettingsMenu />
          </div>
        </div>

        <div className="graph-wrapper">
          <DayLabels />
          <div className="graph-area">
            <MonthLabels weeks={paddedWeeks} />
            <div className="grid">
              {paddedWeeks.map((week, wi) => (
                <div key={wi} className="week-col">
                  {week.map((day, di) => (
                    <ContributionCell
                      key={di}
                      day={day}
                      col={wi}
                      row={di}
                      totalCols={totalCols}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
