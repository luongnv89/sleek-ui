import { render, screen, act } from '@testing-library/react';
import { useGithubStats } from '../useGithubStats';

function apiResponse(stars: number, forks: number): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ stargazers_count: stars, forks_count: forks }),
  } as Response;
}

function mockFetch(impl: () => Promise<Response>) {
  const fetchMock = jest.fn(impl);
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

// Drain pending promise chains (fetch -> json -> setState) inside act
async function flushAsyncChain() {
  await act(async () => {
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }
  });
}

// Capture the polling callback registered with setInterval so tests can
// simulate the passage of time without relying on fake timers
function capturePollCallback() {
  let poll!: () => void;
  jest
    .spyOn(global, 'setInterval')
    .mockImplementation((cb: () => void) => {
      poll = cb;
      return 0 as unknown as ReturnType<typeof setInterval>;
    });
  return () => poll();
}

function Harness() {
  const { stats, loading } = useGithubStats();
  return (
    <div>
      <span data-testid="stars">{stats ? `~${stats.stars}` : 'none'}</span>
      <span data-testid="forks">{stats ? `~${stats.forks}` : 'none'}</span>
      <span data-testid="loading">{loading ? 'loading' : 'done'}</span>
    </div>
  );
}

describe('useGithubStats (#179)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches live stars and forks on mount', async () => {
    mockFetch(() => Promise.resolve(apiResponse(250, 30)));
    render(<Harness />);
    await flushAsyncChain();

    expect(screen.getByTestId('loading')).toHaveTextContent('done');
    expect(screen.getByTestId('stars')).toHaveTextContent('~250');
    expect(screen.getByTestId('forks')).toHaveTextContent('~30');
  });

  it('keeps last-known values when the GitHub API fails (graceful degradation)', async () => {
    const poll = capturePollCallback();
    mockFetch(() => Promise.resolve(apiResponse(250, 30)));
    render(<Harness />);
    await flushAsyncChain();
    expect(screen.getByTestId('stars')).toHaveTextContent('~250');

    mockFetch(() => Promise.reject(new Error('rate limited')));
    await act(async () => {
      poll();
    });
    await flushAsyncChain();

    expect(screen.getByTestId('stars')).toHaveTextContent('~250');
    expect(screen.getByTestId('forks')).toHaveTextContent('~30');
  });

  it('treats non-OK responses (e.g. rate-limited 403) as a failure, not an update', async () => {
    mockFetch(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: async () => ({}),
      } as Response)
    );
    render(<Harness />);
    await flushAsyncChain();

    expect(screen.getByTestId('loading')).toHaveTextContent('done');
    expect(screen.getByTestId('stars')).toHaveTextContent('none');
  });

  it('polls for fresh values while the page stays open', async () => {
    const poll = capturePollCallback();
    const fetchMock = mockFetch(() => Promise.resolve(apiResponse(250, 30)));
    render(<Harness />);
    await flushAsyncChain();
    expect(screen.getByTestId('stars')).toHaveTextContent('~250');

    (fetchMock as jest.Mock).mockImplementation(() =>
      Promise.resolve(apiResponse(300, 30))
    );
    await act(async () => {
      poll();
    });
    await flushAsyncChain();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('stars')).toHaveTextContent('~300');
  });
});
