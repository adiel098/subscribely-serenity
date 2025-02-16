
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Settings, MessagesSquare, CreditCard, 
  Bot, Layout, PlusCircle, Bell
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: "Community Management",
      description: "Manage your Telegram and Discord communities",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Subscription Settings",
      description: "Configure payment plans and access levels",
      icon: CreditCard,
      color: "bg-green-500"
    },
    {
      title: "Bot Integration",
      description: "Set up and customize your community bots",
      icon: Bot,
      color: "bg-purple-500"
    },
    {
      title: "Access Control",
      description: "Manage member permissions and roles",
      icon: Settings,
      color: "bg-orange-500"
    },
    {
      title: "Chat Management",
      description: "Monitor and moderate community discussions",
      icon: MessagesSquare,
      color: "bg-pink-500"
    },
    {
      title: "Analytics Dashboard",
      description: "Track community growth and engagement",
      icon: Layout,
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back{user?.email ? `, ${user.email}` : ''}</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your communities and settings</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Community
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
