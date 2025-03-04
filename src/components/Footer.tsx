import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/contexts/AuthContext';
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-600">
            © 2024 Membify. All rights reserved.
          </div>
          
          {user && (
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="group"
            >
              Go to Dashboard
              <LayoutDashboard className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
