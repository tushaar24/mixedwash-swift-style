
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ConvenienceSection } from "@/components/ConvenienceSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { CallToAction } from "@/components/CallToAction";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <WhyChooseUs />
        <ConvenienceSection />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CallToAction />
      </main>
    </div>
  );
};

export default Index;
