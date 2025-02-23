import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useCommunities } from '@/hooks/useCommunities';
import { useCommunityContext } from '@/contexts/CommunityContext';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Messages = () => {
  const { user } = useAuth();
  const { data: communities, isLoading } = useCommunities();
  const { selectedCommunityId } = useCommunityContext();
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!selectedCommunityId && communities && communities.length > 0) {
      // Optionally, set the first community as default if none is selected
      // setSelectedCommunityId(communities[0].id);
    }
  }, [communities, selectedCommunityId]);

  const handleSend = async () => {
    if (!selectedCommunityId) {
      toast({
        title: "Error",
        description: "Please select a community to send the message.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data: settings, error: settingsError } = await supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .single();

      if (settingsError || !settings?.bot_token) {
        console.error('Error fetching bot token:', settingsError);
        throw new Error('Bot token not found');
      }

      const { data: members, error: membersError } = await supabase
        .from('telegram_chat_members')
        .select('telegram_user_id')
        .eq('community_id', selectedCommunityId);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw new Error('Failed to fetch community members');
      }

      if (!members || members.length === 0) {
        toast({
          title: "Warning",
          description: "No members found in the selected community.",
          variant: "warning",
        });
        return;
      }

      // Send messages to all members
      for (const member of members) {
        try {
          const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: member.telegram_user_id,
              text: message,
              parse_mode: 'HTML'
            }),
          });

          const result = await response.json();
          if (!result.ok) {
            console.error(`Failed to send message to ${member.telegram_user_id}:`, result);
          }
          // Add a small delay to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 30));
        } catch (error) {
          console.error(`Error sending message to ${member.telegram_user_id}:`, error);
        }
      }

      toast({
        title: "Success",
        description: "Message sent to all members in the community!",
      });
      setMessage(''); // Clear the input field after sending
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Communities Yet</h2>
          <p className="text-gray-600 mb-6">Get started by connecting your first community</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full py-[5px] px-[14px]">
      <Card>
        <CardHeader>
          <CardTitle>Send Message to Community</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Input
                type="text"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button onClick={handleSend} disabled={isSending}>
                {isSending ? (
                  <>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
