
import React, { useState } from "react";
import { Bot, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserBotPreference } from "@/group_owners/hooks/useUserBotPreference";
import { TelegramConnectHeader } from "@/group_owners/components/connect/TelegramConnectHeader";

interface TelegramChat {
  id: string;
  title: string;
  type: string;
  photo_url?: string;
}

const CustomBotNewCommunity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isCustomBot, hasCustomBotToken, custom_bot_token, isLoadingBotPreference } = useUserBotPreference();

  const [verificationResults, setVerificationResults] = useState<TelegramChat[] | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // בדיקה אם יש טוקן בוט קאסטום
  const customBotToken = custom_bot_token;

  const handleLoadGroups = async () => {
    if (!customBotToken) {
      toast.error("לא נמצא טוקן לבוט קאסטום");
      navigate("/telegram-bot");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    
    try {
      const response = await supabase.functions.invoke("validate-bot-token", {
        body: { 
          botToken: customBotToken,
          communityId: null
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.valid) {
        setVerificationResults(response.data.chatList || []);
        
        const channelCount = (response.data.chatList || []).filter(chat => chat.type === 'channel').length;
        const groupCount = (response.data.chatList || []).filter(chat => chat.type !== 'channel').length;
        
        if (response.data.chatList && response.data.chatList.length > 0) {
          let successMessage = `הבוט אומת בהצלחה!`;
          if (channelCount > 0 && groupCount > 0) {
            successMessage += ` נמצאו ${channelCount} ${channelCount === 1 ? 'ערוץ' : 'ערוצים'} ו-${groupCount} ${groupCount === 1 ? 'קבוצה' : 'קבוצות'}.`;
          } else if (channelCount > 0) {
            successMessage += ` נמצאו ${channelCount} ${channelCount === 1 ? 'ערוץ' : 'ערוצים'}.`;
          } else if (groupCount > 0) {
            successMessage += ` נמצאו ${groupCount} ${groupCount === 1 ? 'קבוצה' : 'קבוצות'}.`;
          }
          toast.success(successMessage);
        } else {
          toast.warning("הטוקן של הבוט תקין, אך לא נמצאו ערוצים או קבוצות. ודא שהבוט הוא מנהל בלפחות קבוצה או ערוץ אחד.");
        }
      } else {
        setVerificationError(response.data.message || "טוקן הבוט אינו תקין");
        toast.error(`טוקן הבוט אינו תקין: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error("שגיאה באימות טוקן הבוט:", error);
      setVerificationError(error.message || "לא ניתן לאמת את טוקן הבוט");
      toast.error("לא ניתן לאמת את טוקן הבוט. אנא נסה שוב.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddCommunity = async (chat: TelegramChat) => {
    if (!user) {
      toast.error("נדרשת התחברות. אנא התחבר מחדש.");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // בדיקה אם הקהילה כבר קיימת עם מזהה צ'אט זה
      const { data: existingCommunity } = await supabase
        .from('communities')
        .select('id')
        .eq('telegram_chat_id', chat.id)
        .eq('owner_id', user.id)
        .maybeSingle();
        
      if (existingCommunity) {
        toast.warning(`הקהילה ${chat.title} כבר קיימת במערכת`);
        setIsSaving(false);
        return;
      }
      
      // יצירת רשומת קהילה חדשה
      const { data: newCommunity, error: communityError } = await supabase
        .from('communities')
        .insert({
          name: chat.title,
          telegram_chat_id: chat.id,
          telegram_photo_url: chat.photo_url || null,
          is_group: chat.type !== 'channel',
          owner_id: user.id
        })
        .select('id')
        .single();
        
      if (communityError) {
        console.error("שגיאה בשמירת הקהילה:", communityError);
        throw communityError;
      }
      
      toast.success(`הקהילה ${chat.title} נוספה בהצלחה!`);
      
      // מעבר לדשבורד אחרי הוספת הקהילה
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error("שגיאה בהוספת קהילה:", error);
      toast.error("לא ניתן להוסיף את הקהילה. אנא נסה שוב.");
    } finally {
      setIsSaving(false);
    }
  };

  // אם אין טוקן בוט מותאם אישית, נפנה להגדרות הבוט
  if (!isLoadingBotPreference && !customBotToken) {
    toast.info("עליך להגדיר טוקן בוט מותאם אישית תחילה");
    navigate("/telegram-bot");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TelegramConnectHeader />
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-white shadow-xl border border-indigo-100 rounded-xl mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">חיבור קהילה עם בוט מותאם אישית</h2>
                <p className="text-sm text-gray-600">השתמש בבוט שיצרת כדי לחבר את הקהילות שלך</p>
              </div>
            </div>
            
            {!verificationResults && (
              <div className="flex flex-col gap-4">
                <p className="text-gray-600">
                  לחץ על הכפתור למטה כדי לטעון את כל הקבוצות והערוצים שהבוט שלך מחובר אליהם כמנהל.
                </p>
                
                <Button 
                  onClick={handleLoadGroups} 
                  className="bg-indigo-600 hover:bg-indigo-700 w-full"
                  disabled={isVerifying}
                >
                  {isVerifying ? "טוען קהילות..." : "טען קהילות זמינות"}
                </Button>
                
                {verificationError && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-md mt-2">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">{verificationError}</p>
                  </div>
                )}
              </div>
            )}
            
            {verificationResults && verificationResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">קהילות זמינות</h3>
                <p className="text-sm text-gray-600 mb-4">
                  בחר קהילה מהרשימה הבאה כדי להוסיף אותה למערכת:
                </p>
                
                <div className="grid gap-3">
                  {verificationResults.map(chat => (
                    <div 
                      key={chat.id} 
                      className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {chat.photo_url ? (
                            <img src={chat.photo_url} alt={chat.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-medium">
                              {chat.title.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{chat.title}</h4>
                          <p className="text-xs text-gray-500">
                            {chat.type === 'channel' ? 'ערוץ' : 'קבוצה'} • ID: {chat.id}
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleAddCommunity(chat)} 
                        className="bg-green-500 hover:bg-green-600"
                        disabled={isSaving}
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        הוספה
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={handleLoadGroups} 
                  variant="outline"
                  className="mt-4"
                  disabled={isVerifying}
                >
                  רענן רשימה
                </Button>
              </div>
            )}
            
            {verificationResults && verificationResults.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">לא נמצאו קהילות</h3>
                <p className="text-gray-500 mb-4">
                  הבוט שלך אינו מנהל באף קהילה. ודא שהבוט הוגדר כמנהל בערוצים או קבוצות שברצונך לחבר.
                </p>
                <Button 
                  onClick={handleLoadGroups} 
                  variant="outline"
                  disabled={isVerifying}
                >
                  נסה שוב
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomBotNewCommunity;
