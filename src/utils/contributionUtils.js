export function getLevelColor(count) {
  if (count === 0)  return "#0d1117";
  if (count <= 3)   return "#0b3d1c";
  if (count <= 6)   return "#0f7a35";
  if (count <= 9)   return "#1fcc5f";
  return              "#3dffa0";
}

export function getLevelGlow(count) {
  if (count === 0) return "none";
  if (count <= 3)  return "0 0 4px #0b3d1c90";
  if (count <= 6)  return "0 0 5px #0f7a3599";
  if (count <= 9)  return "0 0 7px #1fcc5faa";
  return             "0 0 10px #3dffa0cc";
}

export function padWeeks(weeks) {
  return weeks.map((days) => {
    if (days.length === 7) return days;
    const padded = new Array(7).fill(null);
    days.forEach((day) => {
      const dow = new Date(day.date).getDay();
      padded[dow] = day;
    });
    return padded;
  });
}

export function getMonthLabels(weeks) {
  const labels = [];
  let lastMonth = -1;

  weeks.forEach((week, col) => {
    const day = week.find((d) => d !== null);
    if (!day) return;

    const month = new Date(day.date).getMonth();
    if (month !== lastMonth) {
      labels.push({
        label: new Date(day.date).toLocaleString("default", { month: "short" }),
        col: col + 1,
      });
      lastMonth = month;
    }
  });

  return labels;
}

export function calculateStreak(weeks) {
  const days = weeks
    .flat()
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  if (!days.length) return 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  let i = 0;

  // Skip today if no contributions yet
  if (days[0]?.date === todayStr && days[0].contributionCount === 0) i = 1;

  let streak = 0;
  for (; i < days.length; i++) {
    if (days[i].contributionCount === 0) break;
    streak++;
    if (i + 1 < days.length) {
      const curr = new Date(days[i].date);
      const next = new Date(days[i + 1].date);
      if (Math.round((curr - next) / 86400000) > 1) break;
    }
  }

  return streak;
}
