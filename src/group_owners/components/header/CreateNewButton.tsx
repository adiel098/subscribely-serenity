import { motion } from 'framer-motion';
import { PlusCircle, FolderPlus, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CreateNewButtonProps {
  handleCreateGroup: () => void;
  isMobile?: boolean;
}

export function CreateNewButton({ handleCreateGroup, isMobile = false }: CreateNewButtonProps) {
  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8 rounded-full border-indigo-200 shadow-sm bg-white"
          >
            <PlusCircle className="h-3.5 w-3.5 text-indigo-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={handleCreateGroup}>
            <FolderPlus className="mr-2 h-3 w-3" />
            <span className="text-xs">New Group</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            const createCommunityButton = document.querySelector('[data-testid="create-community-button"]') as HTMLButtonElement;
            if (createCommunityButton) {
              createCommunityButton.click();
            }
          }}>
            <Radio className="mr-2 h-3 w-3" />
            <span className="text-xs">New Channel</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button 
        variant="outline" 
        onClick={handleCreateGroup}
        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2 shadow-sm hover:shadow transition-all duration-300 text-xs py-1 h-8"
        size="sm"
      >
        <FolderPlus className="h-3.5 w-3.5" />
        New Group
      </Button>
    </motion.div>
  );
}
