
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateCommunityGroup } from '@/group_owners/hooks/useCreateCommunityGroup';
import { TelegramChat } from '@/group_owners/types/telegram.types';
import { stringsToTelegramChats } from '@/group_owners/types/telegram.types';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [telegram_chat_id, setTelegramChatId] = useState('');
  const [telegram_invite_link, setTelegramInviteLink] = useState('');
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<string>('basic');
  
  const mutation = useCreateCommunityGroup();
  const isCreating = mutation.isPending;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Missing information',
        description: 'Group name is required',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Convert string array to TelegramChat array using our helper
      const communities = stringsToTelegramChats(selectedCommunities);
      
      const newGroupId = await mutation.mutateAsync({
        name,
        description,
        telegram_chat_id,
        telegram_invite_link,
        communities
      });
      
      toast({
        title: 'Group created!',
        description: 'Your new group has been created successfully.'
      });
      
      if (onSuccess) onSuccess(newGroupId);
      onClose();
      
    } catch (err) {
      console.error('Error creating group:', err);
      toast({
        title: 'Error',
        description: 'Failed to create group. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="communities">Communities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter group name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram_chat_id">Telegram Chat ID</Label>
                <Input
                  id="telegram_chat_id"
                  value={telegram_chat_id}
                  onChange={e => setTelegramChatId(e.target.value)}
                  placeholder="Telegram chat ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram_invite_link">Telegram Invite Link</Label>
                <Input
                  id="telegram_invite_link"
                  value={telegram_invite_link}
                  onChange={e => setTelegramInviteLink(e.target.value)}
                  placeholder="https://t.me/..."
                />
              </div>
              
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setActiveTab('communities')}>
                  Next
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="communities" className="space-y-4 mt-4">
              {/* Communities selection UI would go here */}
              <div className="space-y-2">
                <Label>Selected Communities</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedCommunities.length === 0 
                    ? "No communities selected" 
                    : `${selectedCommunities.length} communities selected`}
                </p>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={() => setActiveTab('basic')}>
                  Back
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
