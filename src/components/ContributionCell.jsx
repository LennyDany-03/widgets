import { useState } from "react";
import Tooltip from "./Tooltip";
import { getLevelColor, getLevelGlow } from "../utils/contributionUtils";

export default function ContributionCell({ day, col, row, totalCols }) {
  const [hover, setHover] = useState(false);

  if (!day) return <div className="cell empty" />;

  const color = getLevelColor(day.contributionCount);
  const glow  = getLevelGlow(day.contributionCount);

  // Horizontal: anchor tooltip to prevent right-edge overflow
  const align = col >= totalCols - 6 ? "right" : col <= 4 ? "left" : "center";
  // Vertical: top rows (Mon = di 1) → show tooltip below so it doesn't hide header
  const dir   = row <= 2 ? "down" : "up";

  return (
    <div
      className={`cell${hover ? " hovered" : ""}`}
      style={{ backgroundColor: color, boxShadow: hover ? glow : "none" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && (
        <Tooltip
          date={day.date}
          count={day.contributionCount}
          align={align}
          dir={dir}
        />
      )}
    </div>
  );
}
