
import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface FeatureItem {
  text: string;
}

interface FeatureSectionProps {
  title: string;
  description: string;
  features: FeatureItem[];
  imageSrc: string;
  imageAlt: string;
  bgColor?: string;
  buttonText?: string;
  reversed?: boolean;
  demoButtonText?: string;
}

export const FeatureSection = ({
  title,
  description,
  features,
  imageSrc,
  imageAlt,
  bgColor = "bg-white",
  buttonText = "Try for free",
  reversed = false,
  demoButtonText = "Book a demo"
}: FeatureSectionProps) => {
  return (
    <section className={`py-20 px-4 sm:px-8 lg:px-16 ${bgColor} w-full`}>
      <div className="container-fluid mx-auto max-w-full">
        <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 max-w-6xl mx-auto`}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <img 
              src={imageSrc} 
              alt={imageAlt}
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:w-1/2 space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-900">{title}</h2>
            <p className="text-lg text-indigo-700">{description}</p>
            
            <div className="space-y-4 pt-4">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3"
                >
                  <Check className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                  <span className="text-indigo-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link to="/auth">
                  {buttonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                <a href="#contact">{demoButtonText}</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
