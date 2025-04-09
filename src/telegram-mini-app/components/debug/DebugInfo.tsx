
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface DebugInfoProps {
  telegramUser?: any;
  community?: any;
  activeSubscription?: any;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ 
  telegramUser, 
  community, 
  activeSubscription 
}) => {
  const isDevelopment = import.meta.env.DEV;
  const showDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

  if (!isDevelopment && !showDebug) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
        <CardDescription>Development tools and system information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Environment</h3>
          <p className="text-sm text-gray-500">
            Mode: {isDevelopment ? 'development' : 'production'}
          </p>
        </div>
        
        <Separator />
        
        {telegramUser && (
          <>
            <div>
              <h3 className="font-medium mb-2">Telegram User</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(telegramUser, null, 2)}
              </pre>
            </div>
            <Separator />
          </>
        )}
        
        {community && (
          <>
            <div>
              <h3 className="font-medium mb-2">Community</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(community, null, 2)}
              </pre>
            </div>
            <Separator />
          </>
        )}
        
        {activeSubscription && (
          <>
            <div>
              <h3 className="font-medium mb-2">Active Subscription</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(activeSubscription, null, 2)}
              </pre>
            </div>
            <Separator />
          </>
        )}
        
        <div>
          <h3 className="font-medium mb-2">App Info</h3>
          <div className="space-y-1 text-sm text-gray-500">
            <p>Version: {import.meta.env.VITE_APP_VERSION || '1.0.0'}</p>
            <p>Build: {import.meta.env.VITE_BUILD_ID || 'development'}</p>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-2">System Status</h3>
          <div className="space-y-1 text-sm text-gray-500">
            <p>API Status: Online</p>
            <p>Database: Connected</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
