import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCommunityContext } from '@/features/community/providers/CommunityContext';
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const Settings = () => {
  const { toast } = useToast();
  const { selectedCommunityId } = useCommunityContext();
  const [communityDetails, setCommunityDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      if (!selectedCommunityId) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .eq('id', selectedCommunityId)
          .single();

        if (error) {
          console.error("Error fetching community details:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load community settings"
          });
        } else {
          setCommunityDetails(data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityDetails();
  }, [selectedCommunityId, toast]);

  const handleSettingsUpdate = async (e: any) => {
    e.preventDefault();
    if (!selectedCommunityId || !communityDetails) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('communities')
        .update({
          name: communityDetails.name,
          description: communityDetails.description,
          is_active: communityDetails.is_active,
          telegram_invite_link: communityDetails.telegram_invite_link
        })
        .eq('id', selectedCommunityId);

      if (error) {
        console.error("Error updating community settings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update community settings"
        });
      } else {
        toast({
          title: "Success",
          description: "Community settings updated successfully"
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setCommunityDetails(prevDetails => ({
      ...prevDetails,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (isLoading) {
    return <div className="text-center">Loading settings...</div>;
  }

  if (!communityDetails) {
    return <div className="text-center">No settings found</div>;
  }

  return (
    <div className="container max-w-3xl py-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Community Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your community settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Update your community's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Community Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={communityDetails.name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={communityDetails.description || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telegram_invite_link">Telegram Invite Link</Label>
            <Input
              type="text"
              id="telegram_invite_link"
              name="telegram_invite_link"
              value={communityDetails.telegram_invite_link || ""}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Community Status</CardTitle>
          <CardDescription>
            Enable or disable your community
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active Community</Label>
            <Switch
              id="is_active"
              name="is_active"
              checked={communityDetails.is_active || false}
              onCheckedChange={(checked) => setCommunityDetails(prevDetails => ({ ...prevDetails, is_active: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Button disabled={isSaving} onClick={handleSettingsUpdate}>
        {isSaving ? "Saving..." : "Update Settings"}
      </Button>
    </div>
  );
};

export default Settings;
