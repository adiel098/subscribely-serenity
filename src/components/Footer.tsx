
import { Button } from "@/features/community/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Button variant="ghost" size="sm">
            About
          </Button>
          <Button variant="ghost" size="sm">
            Blog
          </Button>
          <Button variant="ghost" size="sm">
            Contact
          </Button>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; 2024 Lovable, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
