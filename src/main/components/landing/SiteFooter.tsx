
import { Sparkles } from "lucide-react";

export const SiteFooter = () => {
  return (
    <footer className="py-12 px-4 sm:px-8 lg:px-16 bg-indigo-950 text-white w-full">
      <div className="container-fluid mx-auto max-w-full">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-purple-400" />
              <span className="text-2xl font-bold">Membify</span>
            </div>
            <p className="text-indigo-200 mt-2">
              © {new Date().getFullYear()} Membify. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-indigo-300 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-indigo-300 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-indigo-300 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
