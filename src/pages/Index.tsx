
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
};

export default Index;
