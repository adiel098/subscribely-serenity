
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, MessageCircle } from "lucide-react";

export interface UserProfileCardProps {
  name?: string;
  username?: string;
  photoUrl?: string;
  email?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  username,
  photoUrl,
  email
}) => {
  const displayName = name || username || "Telegram User";
  
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-r from-indigo-50 to-blue-50">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12 border border-indigo-200 shadow-sm">
            {photoUrl ? (
              <AvatarImage src={photoUrl} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                <User className="h-6 w-6" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="space-y-0.5">
            <h3 className="text-sm font-medium text-indigo-900">{displayName}</h3>
            
            {username && (
              <p className="text-xs text-indigo-700 flex items-center">
                <MessageCircle className="h-3 w-3 mr-1 opacity-70" />
                @{username}
              </p>
            )}
            
            {email && (
              <p className="text-xs text-indigo-700 flex items-center">
                <Mail className="h-3 w-3 mr-1 opacity-70" />
                {email}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
