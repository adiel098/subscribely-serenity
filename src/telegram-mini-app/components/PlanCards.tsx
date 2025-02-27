
import React from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { Check, X, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: (plan: Plan) => void;
  colorScheme: {
    background: string;
    highlight: string;
    button: string;
    priceCircle: string;
  };
}

const PlanCard = ({ plan, isSelected, onSelect, colorScheme }: PlanCardProps) => {
  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 h-full ${
        isSelected 
          ? `border-2 border-${colorScheme.highlight} shadow-lg scale-[1.02]` 
          : 'border border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(plan)}
    >
      {/* Background pattern */}
      <div 
        className={`absolute inset-0 ${colorScheme.background} opacity-90 z-0`}
        style={{
          backgroundImage: `radial-gradient(circle at 85% 15%, ${colorScheme.highlight}25 15px, transparent 15px), 
                            radial-gradient(circle at 20% 35%, ${colorScheme.highlight}25 20px, transparent 20px),
                            radial-gradient(circle at 60% 85%, ${colorScheme.highlight}25 18px, transparent 18px)`
        }}
      />

      {/* Card content */}
      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className={`text-2xl font-bold mb-1 text-${colorScheme.highlight}`}>
            {plan.name.toUpperCase()}
          </h3>
          <p className="text-sm opacity-80">{plan.interval.toUpperCase()} PLAN</p>
        </div>
        
        {/* Price Circle */}
        <div className="flex justify-center mb-6">
          <div className={`${colorScheme.priceCircle} w-24 h-24 rounded-full flex items-center justify-center`}>
            <div className="text-white text-center">
              <span className="text-3xl font-bold">${plan.price}</span>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="flex-grow space-y-3 mb-6">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              {feature.startsWith("X-") ? (
                <>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-red-100">
                    <X className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <span className="text-gray-600">{feature.substring(2)}</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-green-100">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Button */}
        <Button 
          className={`w-full ${colorScheme.button} transition-all duration-300 group`}
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(plan);
          }}
        >
          {isSelected ? "Selected" : "Select Plan"}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
      
      {isSelected && (
        <Badge 
          className={`absolute top-0 right-0 m-2 bg-${colorScheme.highlight}`}
        >
          Selected
        </Badge>
      )}
    </Card>
  );
};

interface PlanCardsProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
}

const PlanCards = ({ plans, selectedPlan, onPlanSelect }: PlanCardsProps) => {
  // Define color schemes for different plan types
  const getColorScheme = (index: number) => {
    const schemes = [
      {
        background: "bg-purple-50",
        highlight: "purple-600",
        button: "bg-purple-600 hover:bg-purple-700 text-white",
        priceCircle: "bg-gradient-to-br from-purple-500 to-purple-700",
      },
      {
        background: "bg-blue-50",
        highlight: "blue-600",
        button: "bg-blue-600 hover:bg-blue-700 text-white",
        priceCircle: "bg-gradient-to-br from-blue-500 to-blue-700",
      },
      {
        background: "bg-pink-50",
        highlight: "pink-600",
        button: "bg-pink-600 hover:bg-pink-700 text-white",
        priceCircle: "bg-gradient-to-br from-pink-500 to-pink-700",
      },
      {
        background: "bg-green-50",
        highlight: "green-600",
        button: "bg-green-600 hover:bg-green-700 text-white",
        priceCircle: "bg-gradient-to-br from-green-500 to-green-700",
      },
      {
        background: "bg-orange-50",
        highlight: "orange-600",
        button: "bg-orange-600 hover:bg-orange-700 text-white",
        priceCircle: "bg-gradient-to-br from-orange-500 to-orange-700",
      },
    ];
    
    return schemes[index % schemes.length];
  };

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-8">
      {plans.map((plan, index) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isSelected={selectedPlan?.id === plan.id}
          onSelect={onPlanSelect}
          colorScheme={getColorScheme(index)}
        />
      ))}
    </div>
  );
};

export default PlanCards;
