
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-8 animate-slide-up">
          ניהול קהילות <br className="hidden sm:inline" />
          <span className="text-blue-600">בקלות</span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          נהלו את קהילות הטלגרם והדיסקורד שלכם בקלות. פשטו את המנויים, 
          אוטומציה של גישת חברים, והתמקדו במה שחשוב באמת - הקהילה שלכם.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button size="lg" className="group">
            התחל עכשיו
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Button>
          <Button size="lg" variant="outline">
            צפה בהדגמה
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
