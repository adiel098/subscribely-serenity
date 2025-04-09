
import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { MessageSquare } from 'lucide-react';

const Messages = () => {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title="Messages"
        description="Manage and send messages to your community members"
        icon={<MessageSquare className="h-6 w-6" />}
      />
      
      <div className="mt-6">
        <p className="text-muted-foreground">
          Message management features will be available soon.
        </p>
      </div>
    </div>
  );
};

export default Messages;
