
import { Hero } from "@/features/community/components/Hero";
import { Footer } from "@/features/community/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen w-full">
      <Hero />
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
};

export default Index;
