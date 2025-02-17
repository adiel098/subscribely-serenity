
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { TelegramWebAppContext } from "@/features/community/pages/TelegramMiniApp";
import { useContext } from "react";

export const CommunityHeader = () => {
  const navigate = useNavigate();
  const { selectedCommunity } = useCommunityContext();
  const webApp = useContext(TelegramWebAppContext);

  const handleBack = () => {
    if (webApp?.BackButton.isVisible) {
      webApp.BackButton.hide();
    }
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <Button variant="ghost" size="icon" onClick={handleBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-semibold">{selectedCommunity?.name || 'Community'}</h1>
      <div className="w-8" /> {/* Spacer for alignment */}
    </div>
  );
};
