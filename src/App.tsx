import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { DesignProvider } from '@/context/DesignContext';
import { Layout } from '@/components/layout/Layout';
import { AppliedDesignBanner } from '@/components/AppliedDesignBanner';
import { ScrollToTop } from '@/components/ScrollToTop';
import { HomePage } from '@/components/home/HomePage';

const DesignDetail = lazy(() =>
  import('@/components/DesignDetail').then(m => ({ default: m.DesignDetail }))
);

function RouteLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <p className="text-muted-foreground">Loading design…</p>
    </div>
  );
}

export { getRandomPrompt } from '@/lib/randomPrompt';

function App() {
  return (
    <ThemeProvider>
      <DesignProvider>
        <HashRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/designs/:slug"
                element={
                  <Suspense fallback={<RouteLoading />}>
                    <DesignDetail />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
          <AppliedDesignBanner />
        </HashRouter>
      </DesignProvider>
    </ThemeProvider>
  );
}

export default App;
