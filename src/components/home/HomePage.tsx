import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/home/HeroSection';
import { PainSection } from '@/components/home/PainSection';
import { SocialProofSection } from '@/components/home/SocialProofSection';
import { VideoSection } from '@/components/home/VideoSection';
import { PlanSection } from '@/components/home/PlanSection';
import { PairedThemingSection } from '@/components/home/PairedThemingSection';
import { CatalogSection } from '@/components/home/CatalogSection';
import { CopySiteSection } from '@/components/home/CopySiteSection';
import { FounderSection } from '@/components/home/FounderSection';
import { scrollToSectionId, type SectionScrollState } from '@/hooks/useSectionScroll';

export function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // A header/footer section link fired from another route lands here carrying
  // its target id. Scroll once the sections have mounted, then drop the state so
  // a later back-navigation or reload does not scroll again.
  useEffect(() => {
    const target = (location.state as SectionScrollState | null)?.scrollTo;
    if (!target) return;
    scrollToSectionId(target);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      {/* ── PAIN (moved before video per #83) ── */}
      <PainSection />
      {/* ── SOCIAL PROOF (#79) ── */}
      <SocialProofSection />
      <VideoSection />
      {/* ── PLAN (StoryBrand) ── */}
      <PlanSection />
      {/* ── THEME PAIRING (#187/#191, surfaced by #196) ── */}
      <PairedThemingSection />
      {/* ── COPY A SITE (#189, promoted above the catalog by #196) ── */}
      <CopySiteSection />
      <CatalogSection />
      {/* ── FOUNDER (#82) ── */}
      <FounderSection />
    </div>
  );
}
