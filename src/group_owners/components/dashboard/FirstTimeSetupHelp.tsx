
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Bell, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

interface FirstTimeSetupHelpProps {
  isProject: boolean;
}

export const FirstTimeSetupHelp: React.FC<FirstTimeSetupHelpProps> = ({ isProject }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-purple-100 p-4 rounded-full">
            <Users className="h-10 w-10 text-purple-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Get Started with Your {isProject ? "Project" : "Community"}</h3>
            <p className="text-gray-600 mb-6">
              You don't have any subscribers yet. Here are some steps to get started:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SetupCard 
                icon={<CreditCard className="h-5 w-5 text-purple-600" />}
                title="Create plans"
                description="Set up subscription plans for your members"
                link="/subscriptions"
              />
              
              <SetupCard 
                icon={<Bell className="h-5 w-5 text-purple-600" />}
                title="Configure messages"
                description="Set up automated messages for your members"
                link="/messages"
              />
              
              <SetupCard 
                icon={<Users className="h-5 w-5 text-purple-600" />}
                title="Invite members"
                description="Share your invite link to get members"
                link="/subscribers"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SetupCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const SetupCard: React.FC<SetupCardProps> = ({ icon, title, description, link }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="bg-white p-2 rounded-lg shadow-sm">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-medium mb-1">{title}</h4>
          <p className="text-sm text-gray-500 mb-2">{description}</p>
          <Link to={link}>
            <Button variant="link" className="p-0 h-auto text-purple-600">
              <span>Get started</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
