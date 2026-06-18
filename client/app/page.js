import { HeroSection } from "../components/sections/HeroSection.jsx";
import { ServicesOverview } from "../components/sections/ServicesOverview.jsx";
import { WalletSection } from "../components/sections/WalletSection.jsx";
import { Testimonials } from "../components/sections/Testimonials.jsx";
import { CallToAction } from "../components/sections/CallToAction.jsx";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-12">
      <HeroSection />
      <WalletSection />
      <ServicesOverview />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
