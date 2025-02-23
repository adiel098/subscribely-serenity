import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useCommunityContext } from '@/contexts/CommunityContext';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { selectedCommunityId } = useCommunityContext();
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handleProfileUpdate = useCallback(async () => {
    setIsUpdating(true);
    try {
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const { error } = await supabase.auth.updateUser({
        data: { name },
        email: email,
      });

      if (error) {
        throw error;
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  }, [user, name, email]);

  const handleDeleteAccount = async () => {
    try {
      setIsUpdating(true);
      if (!user) {
        throw new Error("User not authenticated.");
      }
  
      // Delete the user from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
  
      if (authError) {
        console.error("Error deleting user from Supabase Auth:", authError);
        throw new Error("Failed to delete user from authentication system.");
      }
  
      // Optionally, delete any related data from your database
      // For example, if you have a user profile table:
      // const { error: dbError } = await supabase.from('profiles').delete().eq('id', user.id);
  
      // if (dbError) {
      //   console.error("Error deleting user data from database:", dbError);
      //   // Decide if you want to throw an error or just log it
      //   // throw new Error("Failed to delete user data from database.");
      // }
  
      // Sign out the user
      await supabase.auth.signOut();
  
      // Redirect to the index page or any other appropriate route
      navigate("/");
      toast.success("Account deleted successfully.");
    } catch (error: any) {
      console.error("Account deletion failed:", error);
      toast.error(error.message || "Failed to delete account.");
    } finally {
      setIsUpdating(false);
      setDeleteConfirmationOpen(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleProfileUpdate} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Be careful when using these options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="destructive" onClick={() => setDeleteConfirmationOpen(true)}>
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      {deleteConfirmationOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Account Deletion</CardTitle>
              <CardDescription>
                Are you sure you want to delete your account? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setDeleteConfirmationOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isUpdating}>
                  {isUpdating ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Settings;
