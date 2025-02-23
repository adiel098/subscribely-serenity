import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { useCommunityContext } from '@/contexts/CommunityContext';
import { BotStatsHeader } from '@/group_owners/components/bot-settings/BotStatsHeader';
import { WelcomeMessageSection } from '@/group_owners/components/bot-settings/WelcomeMessageSection';
import { SubscriptionSection } from '@/group_owners/components/bot-settings/SubscriptionSection';
import { MessagePreview } from '@/group_owners/components/bot-settings/MessagePreview';
import {
  Accordion,
} from "@/components/ui/accordion";
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const BotSettingsPage = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { settings, isLoading, updateSettings } = useBotSettings(selectedCommunityId || "");
  const [autoWelcome, setAutoWelcome] = useState(false);
  const [botSignature, setBotSignature] = useState("");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (settings) {
      setAutoWelcome(settings.auto_welcome_message);
      setBotSignature(settings.bot_signature);
      setLanguage(settings.language);
    }
  }, [settings]);

  const handleAutoWelcomeToggle = () => {
    const newAutoWelcome = !autoWelcome;
    setAutoWelcome(newAutoWelcome);
    updateSettings.mutate({ auto_welcome_message: newAutoWelcome });
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSignature = e.target.value;
    setBotSignature(newSignature);
    updateSettings.mutate({ bot_signature: newSignature });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    updateSettings.mutate({ language: newLanguage });
  };

  if (isLoading || !settings) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BotStatsHeader communityId={selectedCommunityId || ""} />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <Accordion type="single" collapsible>
              <WelcomeMessageSection settings={settings} updateSettings={updateSettings} />
              <SubscriptionSection settings={settings} updateSettings={updateSettings} />
            </Accordion>

            <div className="border rounded-lg bg-card text-card-foreground p-4 space-y-4">
              <h3 className="text-lg font-semibold">Additional Settings</h3>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-welcome">Auto Welcome Message</Label>
                <Toggle 
                  id="auto-welcome" 
                  pressed={autoWelcome} 
                  onPressedChange={handleAutoWelcomeToggle} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bot-signature">Bot Signature</Label>
                <Input 
                  type="text" 
                  id="bot-signature" 
                  value={botSignature} 
                  onChange={handleSignatureChange} 
                  placeholder="Enter bot signature" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select 
                  id="language" 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-muted-foreground file:h-9 file:w-12 file:flex-1 file:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="en">English</option>
                  <option value="he">עברית</option>
                  {/* Add more languages here */}
                </select>
              </div>
            </div>
          </div>

          <MessagePreview message={settings.welcome_message} signature={settings.bot_signature} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BotSettingsPage;
