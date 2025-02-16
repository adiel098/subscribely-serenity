
import { useState } from "react";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useCommunities } from "@/hooks/useCommunities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusIcon, TrashIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

const Subscriptions = () => {
  const { data: communities } = useCommunities();
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    communities?.[0]?.id ?? null
  );
  const { plans, isLoading, createPlan, updatePlan, deletePlan } = useSubscriptionPlans(
    selectedCommunity ?? ""
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly" as const,
    features: [] as string[],
  });

  const handleCreatePlan = async () => {
    if (!selectedCommunity) {
      toast.error("נא לבחור קהילה");
      return;
    }

    try {
      await createPlan.mutateAsync({
        community_id: selectedCommunity,
        name: newPlan.name,
        description: newPlan.description,
        price: parseFloat(newPlan.price),
        interval: newPlan.interval,
        features: newPlan.features,
      });
      setIsCreateDialogOpen(false);
      setNewPlan({
        name: "",
        description: "",
        price: "",
        interval: "monthly",
        features: [],
      });
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק את תוכנית המנוי הזו?")) {
      await deletePlan.mutateAsync(planId);
    }
  };

  if (!communities?.length) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">אין קהילות</h2>
        <p className="text-gray-600">נא ליצור קהילה חדשה כדי להגדיר תוכניות מנוי</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ניהול מנויים</h1>
        <div className="flex gap-4">
          <Select
            value={selectedCommunity ?? ""}
            onValueChange={(value) => setSelectedCommunity(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="בחר קהילה" />
            </SelectTrigger>
            <SelectContent>
              {communities?.map((community) => (
                <SelectItem key={community.id} value={community.id}>
                  {community.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 ml-2" />
                תוכנית מנוי חדשה
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>יצירת תוכנית מנוי חדשה</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">שם התוכנית</Label>
                  <Input
                    id="name"
                    value={newPlan.name}
                    onChange={(e) =>
                      setNewPlan((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">תיאור</Label>
                  <Textarea
                    id="description"
                    value={newPlan.description}
                    onChange={(e) =>
                      setNewPlan((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">מחיר</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newPlan.price}
                    onChange={(e) =>
                      setNewPlan((prev) => ({ ...prev, price: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interval">תדירות החיוב</Label>
                  <Select
                    value={newPlan.interval}
                    onValueChange={(value: "monthly" | "yearly") =>
                      setNewPlan((prev) => ({ ...prev, interval: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">חודשי</SelectItem>
                      <SelectItem value="yearly">שנתי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreatePlan}>יצירת תוכנית</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">טוען...</div>
      ) : !selectedCommunity ? (
        <div className="text-center py-8">
          <p className="text-gray-600">נא לבחור קהילה כדי לראות את תוכניות המנוי</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan) => (
            <Card key={plan.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-gray-600">
                    ₪{plan.price} / {plan.interval === "monthly" ? "לחודש" : "לשנה"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {plan.description && (
                <p className="text-gray-600 mb-4">{plan.description}</p>
              )}
              {plan.features && plan.features.length > 0 && (
                <ul className="list-disc list-inside space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-gray-600">
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
