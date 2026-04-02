import HeroInteractive from '@/components/sections/HeroInteractive';
import TravelSectionNew from '@/components/sections/TravelSectionNew';
import Recommended from '@/components/sections/Recommended';
import FindOutMoreSection from '@/components/sections/FindOutMoreSection';
import CampandResorts from '@/components/sections/CampandResorts';

export default function Home() {
  return (
    /**
     * Homepage shell
     * ─────────────────────────────────────────────────────────────────────────
     * Layout rules:
     *   • The hero lives inside a tight inset (px-3 pt-3) so its rounded
     *     corners float off the viewport edges — modern editorial look.
     *   • All body sections control only their internal content; the max-width
     *     and horizontal padding are normalised inside each section to
     *     max-w-7xl / px-4 sm:px-6 lg:px-8 so every content column aligns.
     *   • Vertical spacing is owned by each section (py-16 sm:py-20).
     */
    <main className="min-h-screen bg-white">
      {/* ── Hero — inset wrapper creates the premium rounded-card look ─────── */}
      <div className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-5">
        <HeroInteractive />
      </div>

      {/* ── Body sections — no extra wrappers; sections own their own width ─── */}
      <Recommended />
      <TravelSectionNew />
      <CampandResorts />
      <FindOutMoreSection />
    </main>
  );
}
