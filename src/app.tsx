import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Marketing & Legal Pages (instant load)
import HomePage     from './pages/home/HomePage';
import PricingPage  from './pages/pricing/PricingPage';
import TermsPage    from './pages/terms/TermsPage';
import PrivacyPage  from './pages/privacy/PrivacyPage';
import RefundsPage  from './pages/refunds/RefundsPage';
import NotFoundPage from './pages/not-found/NotFoundPage';

// Lazy-load full interactive Atlas & Cardiology Multimedia Hub for ultra-fast landing bundle
const AppShell = lazy(() => import('./app/shell'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center font-display font-bold text-sm">
            Loading Rapid Steps Atlas…
          </div>
        }
      >
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/pricing"  element={<PricingPage />} />
          <Route path="/terms"    element={<TermsPage />} />
          <Route path="/privacy"  element={<PrivacyPage />} />
          <Route path="/refunds"  element={<RefundsPage />} />
          <Route path="/app/*"    element={<AppShell />} />
          <Route path="*"         element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
