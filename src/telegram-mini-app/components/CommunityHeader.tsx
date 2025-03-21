
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

  // Use the telegram description if available, otherwise fall back to the community description
  const displayDescription = description || community.description;
  
  // Check if description is long (more than 150 characters)
  const isLongDescription = displayDescription && displayDescription.length > 150;

  // Check if description overflows the container after rendering
  useEffect(() => {
    if (descriptionRef.current && displayDescription) {
      const element = descriptionRef.current;
      // Check if the content height is greater than the visible height
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
  
  // Toggle description expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    
    // Add haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  return (
    <div className="text-center space-y-6 animate-fade-in">
      {photoLoading ? (
        <div className="relative mx-auto">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-gray-500">Loading...</span>
          </div>
        </div>
      ) : (
        <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20">
          {photoUrl ? (
            <AvatarImage
              src={photoUrl}
              alt={community.name}
              className="object-cover"
              onError={(e) => {
                console.error("[CommunityHeader] Error loading image:", e);
                // Reset the src to force a fallback to the AvatarFallback
                (e.target as HTMLImageElement).src = "";
              }}
            />
          ) : (
            <AvatarFallback className="bg-primary/10">
              {photoError ? (
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-primary mb-1" />
                  <span className="text-xs text-gray-600">No photo</span>
                </div>
              ) : (
                <Crown className="h-12 w-12 text-primary" />
              )}
            </AvatarFallback>
          )}
        </Avatar>
      )}
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 px-4">
        {community.name}
      </h1>
      
      {descriptionLoading ? (
        <div className="mx-auto max-w-xl">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      ) : (
        displayDescription ? (
          <div className="mx-auto max-w-xl px-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-xl p-4 shadow-sm">
              <div 
                ref={descriptionRef} 
                className={`${isExpanded ? '' : 'line-clamp-3'} relative text-sm text-indigo-700/90 leading-relaxed font-medium`}
              >
                <p className="italic">{displayDescription}</p>
              </div>
              
              {shouldShowReadMore && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleExpand}
                  className="mt-1 px-3 py-1 h-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/70 text-xs font-medium"
                >
                  {isExpanded ? (
                    <>Read less <ChevronDown className="ml-1 h-3 w-3" /></>
                  ) : (
                    <>Read more <ChevronRight className="ml-1 h-3 w-3" /></>
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : null  // Don't show anything if there's no description
      )}
    </div>
  );
};
