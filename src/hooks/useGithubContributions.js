import { useEffect, useState } from "react";
import { calculateStreak } from "../utils/contributionUtils";

const QUERY = `
  query($username: String!) {
    user(login: $username) {
      avatarUrl
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

export default function useGithubContributions(overrideUsername) {
  const [weeks, setWeeks]           = useState([]);
  const [totalContributions, setTotal] = useState(0);
  const [streak, setStreak]         = useState(0);
  const [avatarUrl, setAvatarUrl]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const username = overrideUsername || import.meta.env.VITE_GITHUB_USERNAME;
  const token    = import.meta.env.VITE_GITHUB_TOKEN;

  useEffect(() => {
    setLoading(true);
    setError(null);
    setWeeks([]);

    if (!username || !token) {
      setError("Missing VITE_GITHUB_USERNAME or VITE_GITHUB_TOKEN in .env");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetch_ = async () => {
      try {
        const res = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${token}`,
          },
          body: JSON.stringify({ query: QUERY, variables: { username } }),
        });

        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0].message);
        if (!json.data?.user) throw new Error(`User "${username}" not found`);

        const user     = json.data.user;
        const calendar = user.contributionsCollection.contributionCalendar;
        const allWeeks = calendar.weeks.map((w) => w.contributionDays);

        if (cancelled) return;
        setAvatarUrl(user.avatarUrl);
        setWeeks(allWeeks);
        setTotal(calendar.totalContributions);
        setStreak(calculateStreak(allWeeks));
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch_();
    // Only auto-refresh for own user (no override)
    if (!overrideUsername) {
      const interval = setInterval(fetch_, 10 * 60 * 1000);
      return () => { cancelled = true; clearInterval(interval); };
    }
    return () => { cancelled = true; };
  }, [username, token]);

  return { weeks, totalContributions, streak, avatarUrl, loading, error };
}
