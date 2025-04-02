import { Button } from "@/components/ui/button";
import { PlusIcon, Tag, TicketIcon } from "lucide-react";

interface EmptyCouponsStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

export const EmptyCouponsState = ({ 
  title,
  description,
  icon = <Tag className="h-10 w-10 text-indigo-500" />,
  showCreateButton = false,
  onCreateClick
}: EmptyCouponsStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-lg">
      <div className="bg-indigo-100 p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {description}
      </p>
      
      {showCreateButton && onCreateClick && (
        <Button 
          onClick={onCreateClick} 
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" />
          Create Your First Coupon
        </Button>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-4xl">
        <FeatureCard
          icon={<TicketIcon className="h-8 w-8 text-indigo-500" />}
          title="Percentage Discounts"
          description="Offer a percentage off your subscription price, perfect for promotions."
        />
        <FeatureCard
          icon={<TicketIcon className="h-8 w-8 text-green-500" />}
          title="Fixed Amount Off"
          description="Give subscribers a fixed discount amount on their subscription."
        />
        <FeatureCard
          icon={<TicketIcon className="h-8 w-8 text-amber-500" />}
          title="Limited-Time Offers"
          description="Create time-limited coupons to add urgency to your promotions."
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm">
      <div className="mb-3">{icon}</div>
      <h4 className="text-base font-medium mb-2">{title}</h4>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};
