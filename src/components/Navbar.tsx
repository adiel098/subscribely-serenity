
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-semibold">Membify</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <a href="#features" className="text-gray-700 hover:text-gray-900 transition-colors">
              תכונות
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors">
              מחירים
            </a>
            <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors">
              צור קשר
            </a>
            {user ? (
              <Button onClick={() => signOut()} variant="outline">
                התנתק
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  כניסה
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  הרשמה
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-gray-200">
            <a
              href="#features"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              תכונות
            </a>
            <a
              href="#pricing"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              מחירים
            </a>
            <a
              href="#contact"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              צור קשר
            </a>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <Button onClick={() => signOut()} variant="outline" className="w-full">
                  התנתק
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate('/auth')} className="w-full mb-2">
                    כניסה
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="w-full">
                    הרשמה
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
