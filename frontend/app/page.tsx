import { VelorixHero } from "@/components/landing/velorix-hero";
import { LandingSections } from "@/components/landing/landing-sections";

export default function HomePage() {
  return (
    <div className="dark bg-black">
      <VelorixHero />
      <LandingSections />
    </div>
  );
}
