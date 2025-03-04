
import { Sparkles } from "lucide-react";

export const SiteFooter = () => {
  return (
    <footer className="py-12 px-4 sm:px-8 lg:px-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-indigo-400" />
              <span className="text-2xl font-bold">Membify</span>
            </div>
            <p className="text-gray-400 mt-2">
              © {new Date().getFullYear()} Membify. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
