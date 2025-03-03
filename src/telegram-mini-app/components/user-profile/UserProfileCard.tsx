
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail } from "lucide-react";

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
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            {photoUrl ? (
              <AvatarImage src={photoUrl} alt={displayName} />
            ) : (
              <AvatarFallback>
                <User className="h-8 w-8 text-primary/70" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{displayName}</h3>
            
            {username && (
              <p className="text-sm text-muted-foreground flex items-center">
                <User className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                @{username}
              </p>
            )}
            
            {email && (
              <p className="text-sm text-muted-foreground flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                {email}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
