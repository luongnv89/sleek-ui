import { useEffect, useState } from 'react';

const REPO_API_URL = 'https://api.github.com/repos/luongnv89/sleek-ui';
const POLL_INTERVAL_MS = 5 * 60 * 1000;

export interface GithubStats {
  stars: number;
  forks: number;
}

export function useGithubStats(): { stats: GithubStats | null; loading: boolean } {
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchStats = async () => {
      try {
        const res = await fetch(REPO_API_URL, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        if (typeof data.stargazers_count !== 'number' || typeof data.forks_count !== 'number') {
          throw new Error('Unexpected GitHub API payload');
        }
        setStats({ stars: data.stargazers_count, forks: data.forks_count });
      } catch {
        // Keep last-known values on network failure or rate limiting (#179)
      } finally {
        if (alive) setLoading(false);
      }
    };

    void fetchStats();
    const intervalId = setInterval(() => void fetchStats(), POLL_INTERVAL_MS);

    return () => {
      alive = false;
      clearInterval(intervalId);
    };
  }, []);

  return { stats, loading };
}
