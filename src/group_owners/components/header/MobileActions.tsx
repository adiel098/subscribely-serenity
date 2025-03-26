import { motion } from 'framer-motion';
import { Copy, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface MobileActionsProps {
  selectedCommunityId: string | null;
  selectedGroupId: string | null;
  isGroupSelected: boolean;
  botUsername: string;
}

export function MobileActions({ selectedCommunityId, selectedGroupId, isGroupSelected, botUsername }: MobileActionsProps) {
  const navigate = useNavigate();

  if (!selectedCommunityId) return null;

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const linkParam = selectedGroupId || selectedCommunityId;
          const miniAppLink = `https://t.me/${botUsername}?start=${linkParam}`;
          navigator.clipboard.writeText(miniAppLink)
            .then(() => {
              toast.success("Link copied to clipboard");
            })
            .catch(() => {
              toast.error("Failed to copy link");
            });
        }}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
        title="Copy link"
      >
        <Copy className="h-3 w-3" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isGroupSelected && selectedGroupId) {
            navigate(`/groups/${selectedGroupId}/edit`);
          } else if (selectedCommunityId) {
            navigate(`/communities/${selectedCommunityId}/edit`);
          }
        }}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
        title="Edit link"
      >
        <Edit className="h-3 w-3" />
      </motion.button>
    </div>
  );
}
