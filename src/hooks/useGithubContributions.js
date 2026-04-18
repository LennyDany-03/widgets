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

export default function useGithubContributions() {
  const [weeks, setWeeks]                     = useState([]);
  const [totalContributions, setTotal]        = useState(0);
  const [streak, setStreak]                   = useState(0);
  const [avatarUrl, setAvatarUrl]             = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);

  const username = import.meta.env.VITE_GITHUB_USERNAME;
  const token    = import.meta.env.VITE_GITHUB_TOKEN;

  useEffect(() => {
    if (!username || !token) {
      setError("Missing VITE_GITHUB_USERNAME or VITE_GITHUB_TOKEN in .env");
      setLoading(false);
      return;
    }

    const fetchContributions = async () => {
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

        const user     = json.data.user;
        const calendar = user.contributionsCollection.contributionCalendar;
        const allWeeks = calendar.weeks.map((w) => w.contributionDays);

        setAvatarUrl(user.avatarUrl);
        setWeeks(allWeeks);
        setTotal(calendar.totalContributions);
        setStreak(calculateStreak(allWeeks));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
    const interval = setInterval(fetchContributions, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [username, token]);

  return { weeks, totalContributions, streak, avatarUrl, loading, error };
}
