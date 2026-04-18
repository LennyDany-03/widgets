const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function DayLabels() {
  return (
    <div className="day-labels">
      {DAYS.map((day, i) => (
        <span key={i} className="day-label">
          {day}
        </span>
      ))}
    </div>
  );
}