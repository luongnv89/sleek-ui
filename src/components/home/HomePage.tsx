import { HeroSection } from '@/components/home/HeroSection';
import { PainSection } from '@/components/home/PainSection';
import { SocialProofSection } from '@/components/home/SocialProofSection';
import { VideoSection } from '@/components/home/VideoSection';
import { PlanSection } from '@/components/home/PlanSection';
import { PairedThemingSection } from '@/components/home/PairedThemingSection';
import { CatalogSection } from '@/components/home/CatalogSection';
import { CopySiteSection } from '@/components/home/CopySiteSection';
import { FounderSection } from '@/components/home/FounderSection';

export function HomePage() {
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
