import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: number;
  className?: string;
}

/**
 * A simple loading spinner component
 * 
 * @param size Optional size for the loader (default: 24px)
 * @param className Optional additional CSS classes
 */
const Loader: React.FC<LoaderProps> = ({ size = 24, className = '' }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary" />
    </div>
  );
};

export default Loader;
