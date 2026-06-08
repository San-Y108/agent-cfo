import { LandingHero } from "@/components/landing/landing-hero";
import { LandingBento } from "@/components/landing/landing-bento";

export default function HomePage() {
  return (
    <main className="relative bg-[#030712]">
      <LandingHero />
      <LandingBento />
    </main>
  );
}
