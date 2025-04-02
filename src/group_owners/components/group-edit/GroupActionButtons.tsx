import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface GroupActionButtonsProps {
  handleSave: () => void;
  isSaving: boolean;
}

const GroupActionButtons: React.FC<GroupActionButtonsProps> = ({ handleSave, isSaving }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-end space-x-3 mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(-1)} // Go back to the previous page
        disabled={isSaving}
        className="border-gray-300 text-gray-700 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Changes
      </Button>
    </div>
  );
};

export default GroupActionButtons;
