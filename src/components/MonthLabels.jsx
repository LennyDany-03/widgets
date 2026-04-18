import { getMonthLabels } from "../utils/contributionUtils";

export default function MonthLabels({ weeks }) {
  const labels = getMonthLabels(weeks);
  return (
    <div className="month-labels">
      {labels.map(({ label, col }) => (
        <span key={col} className="month-label" style={{ gridColumn: col }}>
          {label}
        </span>
      ))}
    </div>
  );
}
