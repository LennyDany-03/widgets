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

export default function useGithubContributions(username, token, options = {}) {
  const [weeks, setWeeks]           = useState([]);
  const [totalContributions, setTotal] = useState(0);
  const [streak, setStreak]         = useState(0);
  const [avatarUrl, setAvatarUrl]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const resolvedUsername = username || import.meta.env.VITE_GITHUB_USERNAME;
  const resolvedToken = token;
  const { autoRefresh = false } = options;

  useEffect(() => {
    setLoading(true);
    setError(null);
    setWeeks([]);

    if (!resolvedUsername || !resolvedToken) {
      setError("Missing GitHub username or token");
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
            Authorization: `bearer ${resolvedToken}`,
          },
          body: JSON.stringify({ query: QUERY, variables: { username: resolvedUsername } }),
        });

        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0].message);
        if (!json.data?.user) throw new Error(`User "${resolvedUsername}" not found`);

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
    if (autoRefresh) {
      const interval = setInterval(fetch_, 10 * 60 * 1000);
      return () => { cancelled = true; clearInterval(interval); };
    }
    return () => { cancelled = true; };
  }, [resolvedUsername, resolvedToken, autoRefresh]);

  return { weeks, totalContributions, streak, avatarUrl, loading, error };
}
