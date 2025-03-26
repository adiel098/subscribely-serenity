import { Menu, X } from 'lucide-react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export const MobileMenuButton = ({ isOpen, toggleMenu }: MobileMenuButtonProps) => {
  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 focus:outline-none transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </div>
  );
};
