
import { useEffect } from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";

export const useBackButton = (selectedPlan: Plan | null, activeTab: string, resetFn: () => void) => {
  useEffect(() => {
    // If we're in Telegram, try to use BackButton
    if (window.Telegram?.WebApp?.BackButton) {
      if (selectedPlan && activeTab === "subscribe") {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
          resetFn();
          window.Telegram.WebApp.BackButton.hide();
        });
      } else {
        window.Telegram.WebApp.BackButton.hide();
      }
    }
  }, [selectedPlan, activeTab, resetFn]);
};
