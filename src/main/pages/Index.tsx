
import Navbar from "@/components/Navbar";
import { FeatureSection } from "@/main/components/landing/FeatureSection";
import { RevenueCalculator } from "@/main/components/landing/RevenueCalculator";
import { HeroSection } from "@/main/components/landing/HeroSection";
import { CtaSection } from "@/main/components/landing/CtaSection";
import { SiteFooter } from "@/main/components/landing/SiteFooter";

export default function Index() {
  const managementFeatures = [
    { text: "Connect new and existing Telegram communities" },
    { text: "Accept free or paid Telegram members" },
    { text: "Customize and brand your invite page" },
    { text: "Embed payments directly on your website" }
  ];
  
  const paymentFeatures = [
    { text: "Stripe integration for global payments" },
    { text: "All major credit cards supported" },
    { text: "Apple Pay & Google Pay integration" },
    { text: "Wide range of Cryptocurrencies" }
  ];
  
  const monitorFeatures = [
    { text: "Easily track membership activity" },
    { text: "Monitor your most important metrics" },
    { text: "Quickly refund or cancel subscriptions" },
    { text: "Build automated workflows with integrations" }
  ];
  
  const supportFeatures = [
    { text: "Unlimited 24/7 support" },
    { text: "1-1 Configuration consultation" },
    { text: "99.99% Uptime guarantee" },
    { text: "Dedicated account manager" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Feature Sections */}
      <FeatureSection 
        title="Start & Grow 🚀" 
        description="Membify gives you everything you need to build a thriving paid Telegram community. You focus on great content and growth, and we handle everything else, from invites to permissions and more." 
        features={managementFeatures} 
        imageSrc="/lovable-uploads/922e3de0-b097-4b2c-8e97-32aa579d045a.png" 
        imageAlt="Community Management Platform" 
        bgColor="bg-white" 
      />
      
      <FeatureSection 
        title="Get Paid Globally 💸" 
        description="Enhance convenience and streamline payments with a flexible wide range of options on Membify." 
        features={paymentFeatures} 
        imageSrc="/lovable-uploads/9ffe418a-ad3f-4a1c-9576-89f7129a1b8f.png" 
        imageAlt="Global Payment Options" 
        bgColor="bg-green-50" 
        reversed={true} 
      />
      
      <FeatureSection 
        title="Monitor & Manage 📊" 
        description="Built-in member management features like billing and community analytics make administration a breeze, while your activity feed lets you keep your finger on the pulse of your community." 
        features={monitorFeatures} 
        imageSrc="/lovable-uploads/1fe01199-01ba-4d5d-9d6e-88af5097a5f0.png" 
        imageAlt="Analytics Dashboard" 
        bgColor="bg-white" 
      />
      
      <FeatureSection 
        title="Unparalleled Support 🎧" 
        description="Our Customer Success team offers reliable and dedicated support to help you grow your membership business." 
        features={supportFeatures} 
        imageSrc="/lovable-uploads/d7b82bfb-6189-40c0-8cba-643eb0c03b4c.png" 
        imageAlt="Customer Support" 
        bgColor="bg-amber-50" 
        reversed={true} 
        buttonText="Get started for free" 
      />
      
      {/* Revenue Calculator Section */}
      <RevenueCalculator />
      
      {/* CTA Section */}
      <CtaSection />
      
      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
