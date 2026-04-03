import HeroInteractive from '@/components/sections/HeroInteractive';
import Recommended from '@/components/sections/Recommended';
import RecommendedDestinations from '@/components/sections/RecommendedDestinations';
import TravelSectionNew from '@/components/sections/TravelSectionNew';
import CampandResorts from '@/components/sections/CampandResorts';
import FindOutMoreSection from '@/components/sections/FindOutMoreSection';

export default function Home() {
  return (
    /**
     * Homepage shell
     * ─────────────────────────────────────────────────────────────────────────
     * Layout rules:
     *   • Hero lives inside a tight inset so its rounded corners float off
     *     the viewport edges — modern editorial look.
     *   • All body sections use max-w-7xl / px-4 sm:px-6 lg:px-8 internally
     *     so content columns align consistently.
     *   • Section spacing: py-16 sm:py-20 on every body section.
     *   • Section order: Tours → Destinations → Editorial → Stays → Info
     */
    <main className="min-h-screen bg-white">
      {/* ── Hero — inset wrapper creates the premium rounded-card look ─────── */}
      <div className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-5">
        <HeroInteractive />
      </div>

      {/* ── Recommended Tours ────────────────────────────────────────────────── */}
      <Recommended />

      {/* ── Recommended Destinations ─────────────────────────────────────────── */}
      <RecommendedDestinations />

      {/* ── WeMongolia Experiences (editorial) ───────────────────────────────── */}
      <TravelSectionNew />

      {/* ── Ger Camps & Resorts ───────────────────────────────────────────────── */}
      <CampandResorts />

      {/* ── Find Out More ─────────────────────────────────────────────────────── */}
      <FindOutMoreSection />
    </main>
  );
}
