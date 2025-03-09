
import React, { useEffect } from "react";
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
  
  // Log email data for debugging
  useEffect(() => {
    console.log("UserProfileCard - Email prop:", email);
    console.log("UserProfileCard - All props:", { name, username, photoUrl, email });
  }, [name, username, photoUrl, email]);
  
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-r from-indigo-50 to-blue-50">
      <CardContent className="p-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 border border-indigo-200">
            {photoUrl ? (
              <AvatarImage src={photoUrl} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="space-y-0">
            <h3 className="text-xs font-medium text-indigo-900">{displayName}</h3>
            
            <div className="flex flex-col">
              {username && (
                <p className="text-[10px] text-indigo-700 flex items-center">
                  <MessageCircle className="h-2.5 w-2.5 mr-0.5 opacity-70" />
                  @{username}
                </p>
              )}
              
              {email && (
                <p className="text-[10px] text-indigo-700 flex items-center">
                  <Mail className="h-2.5 w-2.5 mr-0.5 opacity-70" />
                  {email}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
