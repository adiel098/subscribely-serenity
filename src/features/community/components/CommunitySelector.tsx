import { useMemo } from "react";
import { Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useCommunities } from "@/hooks/community/useCommunities";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { usePaymentMethods } from "@/hooks/telegram-mini-app/usePaymentMethods";
import { useSubscriptionPlans } from "@/hooks/community/useSubscriptionPlans";

const CommunitySelector = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: communities, isLoading } = useCommunities();
  const { selectedCommunityId, setSelectedCommunityId } = useCommunityContext();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: subscriptionPlans } = useSubscriptionPlans(selectedCommunityId || "");

  const addNewCommunity = () => {
    navigate('/platform-select');
  };

  const hasPaymentMethods = useMemo(() => {
    return paymentMethods && paymentMethods.length > 0;
  }, [paymentMethods]);

  const hasSubscriptionPlans = useMemo(() => {
    return subscriptionPlans && subscriptionPlans.length > 0;
  }, [subscriptionPlans]);

  return (
    <div className="border rounded-md shadow-sm bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Select Community</h2>
        <Button size="sm" onClick={addNewCommunity}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
      <div className="p-4">
        {isLoading ? (
          <p>Loading communities...</p>
        ) : communities && communities.length > 0 ? (
          <div className="space-y-2">
            {communities.map((community) => (
              <div
                key={community.id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                  selectedCommunityId === community.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => setSelectedCommunityId(community.id)}
              >
                <div className="flex items-center space-x-3">
                  {community.telegram_photo_url ? (
                    <img
                      src={community.telegram_photo_url}
                      alt={community.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {community.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{community.name}</span>
                </div>
                {selectedCommunityId === community.id && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No communities found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitySelector;
