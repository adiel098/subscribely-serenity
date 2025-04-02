import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface GroupDetailsFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  customLink: string;
  setCustomLink: (customLink: string) => void;
  isSaving: boolean;
}

const GroupDetailsForm: React.FC<GroupDetailsFormProps> = ({
  name,
  setName,
  description,
  setDescription,
  customLink,
  setCustomLink,
  isSaving,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-indigo-700">
            Group Details
          </CardTitle>
          <CardDescription>
            Basic information about your group
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-indigo-800">Group Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                placeholder="Enter group name"
                className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customLink" className="text-indigo-800">Custom Link</Label>
              <Input
                id="customLink"
                value={customLink}
                onChange={(e) => setCustomLink(e.target.value)}
                disabled={isSaving}
                placeholder="Enter custom link"
                className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-indigo-800">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              placeholder="Enter group description"
              className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GroupDetailsForm;
