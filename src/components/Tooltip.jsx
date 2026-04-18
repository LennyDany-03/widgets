export default function Tooltip({ date, count, align = "center", dir = "up" }) {
  const formatted = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
    year:    "numeric",
  });

  return (
    <div className={`tooltip align-${align} dir-${dir}`}>
      <strong>
        {count === 0
          ? "No contributions"
          : `${count} contribution${count !== 1 ? "s" : ""}`}
      </strong>
      <span>{formatted}</span>
    </div>
  );
}
