import HeroInteractive from '@/components/sections/HeroInteractive';
import TravelSectionNew from '@/components/sections/TravelSectionNew';
import Recommended from '@/components/sections/Recommended';
import FindOutMoreSection from '@/components/sections/FindOutMoreSection';
import CampandResorts from '@/components/sections/CampandResorts';

export default function Home() {
  return (
    <main className="min-h-screen">
     
      <HeroInteractive />
       <Recommended />
      <TravelSectionNew /> 
      <CampandResorts />
      <FindOutMoreSection />
     
    </main>
  );
}
