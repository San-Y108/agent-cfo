import { VelorixHero } from "@/components/landing/velorix-hero";
import { TransactionMarquee } from "@/components/landing/transaction-marquee";
import { LandingSections } from "@/components/landing/landing-sections";

export default function HomePage() {
  return (
    <div className="dark bg-black">
      <VelorixHero />
      <TransactionMarquee />
      <LandingSections />
    </div>
  );
}
