
import { Menu, X } from 'lucide-react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export const MobileMenuButton = ({ isOpen, toggleMenu }: MobileMenuButtonProps) => {
  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </div>
  );
};
