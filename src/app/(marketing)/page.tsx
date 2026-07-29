import { Hero } from "@/components/landing/Hero";
import { SaleInfo } from "@/components/landing/SaleInfo";
import { LotGallery } from "@/components/landing/LotGallery";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Advantages } from "@/components/landing/Advantages";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CallToAction } from "@/components/landing/CallToAction";
import { FomoToast } from "@/components/landing/FomoToast";

export default function MarketingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SaleInfo />
      <LotGallery />
      <HowItWorks />
      <Advantages />
      <Testimonials />
      <FAQ />
      <CallToAction />
      <FomoToast />
    </div>
  );
}
