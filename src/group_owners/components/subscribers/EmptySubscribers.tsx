
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EmptySubscribersProps {
  isProjectSelected?: boolean;
}

export const EmptySubscribers: React.FC<EmptySubscribersProps> = ({ isProjectSelected = false }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-gray-100 p-3 rounded-full">
        <Users className="h-8 w-8 text-gray-500" />
      </div>
      
      <h2 className="mt-4 text-lg font-medium text-gray-900">
        No subscribers yet
      </h2>
      
      <p className="mt-1 text-sm text-gray-500 max-w-md">
        {isProjectSelected 
          ? "You haven't added any subscribers to this project yet. Share your project link to start getting subscribers."
          : "You haven't added any subscribers to this community yet. Share your community link to start getting subscribers."
        }
      </p>
      
      <div className="mt-6">
        <Button
          onClick={() => navigate(isProjectSelected ? '/projects/invite' : '/invite')}
        >
          Invite Members
        </Button>
      </div>
    </div>
  );
};
