import HeroInteractive from '@/components/sections/HeroInteractive';
import TravelSectionNew from '@/components/sections/TravelSectionNew';
import Recommended from '@/components/sections/Recommended';
import FindOutMoreSection from '@/components/sections/FindOutMoreSection';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/layout/Navbar';
import CampandResorts from '@/components/sections/CampandResorts';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroInteractive />
       <Recommended />
      <TravelSectionNew /> 
      <CampandResorts />
      <FindOutMoreSection />
      <Footer />
    </main>
  );
}
