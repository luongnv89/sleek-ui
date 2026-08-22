import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { DesignProvider } from '@/context/DesignContext';
import { Layout } from '@/components/layout/Layout';
import { DesignDetail } from '@/components/DesignDetail';
import { AppliedDesignBanner } from '@/components/AppliedDesignBanner';
import { ScrollToTop } from '@/components/ScrollToTop';
import { HomePage } from '@/components/home/HomePage';

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
              <Route path="/designs/:slug" element={<DesignDetail />} />
            </Route>
          </Routes>
          <AppliedDesignBanner />
        </HashRouter>
      </DesignProvider>
    </ThemeProvider>
  );
}

export default App;
