
import React, { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, ImageIcon, ChevronDown, ChevronRight } from "lucide-react";
import { Community } from "@/telegram-mini-app/types/community.types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTelegramChatPhoto } from "@/telegram-mini-app/hooks/useTelegramChatPhoto";
import { useTelegramChannelInfo } from "@/telegram-mini-app/hooks/useTelegramChannelInfo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface CommunityHeaderProps {
  community: Community;
}

export const CommunityHeader = ({ community }: CommunityHeaderProps) => {
  console.log("[CommunityHeader] Rendering with community:", JSON.stringify(community, null, 2));
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowReadMore, setShouldShowReadMore] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  
  const { photoUrl, loading: photoLoading, error: photoError } = useTelegramChatPhoto({
    communityId: community.id,
    telegramChatId: community.telegram_chat_id,
    existingPhotoUrl: community.telegram_photo_url,
    forceFetch: !community.telegram_photo_url // Force fetch if there's no existing photo
  });

  const { description, loading: descriptionLoading, error: descriptionError } = useTelegramChannelInfo({
    communityId: community.id,
    telegramChatId: community.telegram_chat_id,
    autoUpdate: true
  });

  useEffect(() => {
    console.log("[CommunityHeader] Photo details - URL:", photoUrl, "Loading:", photoLoading, "Error:", photoError);
    console.log("[CommunityHeader] Description details - Value:", description, "Loading:", descriptionLoading, "Error:", descriptionError);
  }, [photoUrl, photoLoading, photoError, description, descriptionLoading, descriptionError]);

  const displayDescription = description || community.description;
  
  const isLongDescription = displayDescription && displayDescription.length > 100;

  useEffect(() => {
    if (descriptionRef.current && displayDescription) {
      const element = descriptionRef.current;
      const isOverflowing = element.scrollHeight > element.clientHeight;
      setShouldShowReadMore(isOverflowing || isLongDescription);
      
      console.log("[CommunityHeader] Description overflow check:", {
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        isOverflowing,
        shouldShowButton: isOverflowing || isLongDescription
      });
    }
  }, [displayDescription, isLongDescription]);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  return (
    <div className="text-center space-y-4 animate-fade-in pt-4 pb-4">
      <div className="mx-auto max-w-xl px-4">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-center mb-0.5">
            {photoLoading ? (
              <Skeleton className="h-16 w-16 rounded-full" />
            ) : (
              <Avatar className="h-16 w-16 border-4 border-white/90 shadow-sm">
                {photoUrl ? (
                  <AvatarImage
                    src={photoUrl}
                    alt={community.name}
                    className="object-cover"
                    onError={(e) => {
                      console.error("[CommunityHeader] Error loading image:", e);
                      (e.target as HTMLImageElement).src = "";
                    }}
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10">
                    {photoError ? (
                      <ImageIcon className="h-6 w-6 text-primary" />
                    ) : (
                      <Crown className="h-8 w-8 text-primary" />
                    )}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 mb-0.5">
            {community.name}
          </h2>
          
          {descriptionLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          ) : displayDescription ? (
            <div>
              <div 
                ref={descriptionRef} 
                className={`${isExpanded ? '' : 'line-clamp-2'} relative text-sm text-indigo-700/90 leading-relaxed font-medium`}
              >
                <p className="italic">{displayDescription}</p>
              </div>
              
              {shouldShowReadMore && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleExpand}
                  className="mt-1 px-2 py-0.5 h-5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/70 text-[7px] font-medium"
                >
                  {isExpanded ? (
                    <>Read less <ChevronDown className="ml-1 h-3 w-3" /></>
                  ) : (
                    <>Read more <ChevronRight className="ml-1 h-3 w-3" /></>
                  )}
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
