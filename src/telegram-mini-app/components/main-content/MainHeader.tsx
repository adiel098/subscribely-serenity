
import React from "react";
import { motion } from "framer-motion";
import { Community } from "@/telegram-mini-app/types/community.types";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { UserProfileCard } from "@/telegram-mini-app/components/user-profile/UserProfileCard";
import { CommunityHeader } from "@/telegram-mini-app/components/CommunityHeader";

interface MainHeaderProps {
  telegramUser: TelegramUser;
  community: Community;
}

export const MainHeader = ({ telegramUser, community }: MainHeaderProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <UserProfileCard telegramUser={telegramUser} community={community} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <CommunityHeader community={community} />
      </motion.div>
    </>
  );
};
