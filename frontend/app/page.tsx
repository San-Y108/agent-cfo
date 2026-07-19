import { VelorixHero } from "@/components/landing/velorix-hero";
import { TransactionMarquee } from "@/components/landing/transaction-marquee";
import { LandingSections } from "@/components/landing/landing-sections";
import { GlobalParticleBackground } from "@/components/landing/global-particle-background";

export default function HomePage() {
  return (
    <div className="dark bg-black text-fg relative">
      {/* Global fixed particle background — covers entire viewport, all scroll positions */}
      <GlobalParticleBackground />
      {/* Content layers above particle background */}
      <VelorixHero />
      <TransactionMarquee />
      <LandingSections />
    </div>
  );
}
