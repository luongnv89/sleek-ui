import { HeroSection } from '@/components/home/HeroSection';
import { PainSection } from '@/components/home/PainSection';
import { SocialProofSection } from '@/components/home/SocialProofSection';
import { VideoSection } from '@/components/home/VideoSection';
import { PlanSection } from '@/components/home/PlanSection';
import { CatalogSection } from '@/components/home/CatalogSection';
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
      <CatalogSection />
      {/* ── FOUNDER (#82) ── */}
      <FounderSection />
    </div>
  );
}
