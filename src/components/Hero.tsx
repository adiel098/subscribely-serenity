import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
      </div>
      
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-8 animate-slide-up">
            Community Management <br className="hidden sm:inline" />
            <span className="text-blue-600">Made Simple</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Manage your Telegram and Discord communities with ease. Streamline subscriptions, 
            automate member access, and focus on what matters most - your community.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" className="group" onClick={() => navigate('/auth')}>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
