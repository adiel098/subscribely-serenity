
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CtaSection = () => {
  return (
    <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-500 text-white w-full">
      <div className="container-fluid mx-auto max-w-full">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to monetize your Telegram community? 🚀
          </h2>
          <p className="text-xl text-white/90">
            Join thousands of community owners already using Membify to turn their passion into profit.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button 
              asChild 
              size="lg" 
              className="text-lg bg-white text-purple-700 hover:bg-gray-100 hover:text-purple-800 rounded-xl shadow-md"
            >
              <Link to="/auth">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="text-lg border-white text-white hover:bg-white/10 rounded-xl"
            >
              <a href="https://t.me/membifybot" target="_blank" rel="noopener noreferrer">
                Contact Us
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
