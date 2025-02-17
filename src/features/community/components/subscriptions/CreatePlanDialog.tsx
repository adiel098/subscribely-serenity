import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";

interface CreatePlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePlanDialog = ({ isOpen, onOpenChange }: CreatePlanDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [interval, setInterval] = useState<"monthly" | "quarterly" | "half-yearly" | "yearly" | "one-time">("monthly");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const { toast } = useToast();
  const { selectedCommunityId } = useCommunityContext();

  const { createPlan } = useSubscriptionPlans(selectedCommunityId || "");

  const handleAddFeature = () => {
    if (newFeature.trim() !== "") {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !interval) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    try {
      const priceNumber = parseFloat(price);
      if (isNaN(priceNumber)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Price must be a number.",
        });
        return;
      }

      if (!selectedCommunityId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No community selected.",
        });
        return;
      }

      await createPlan.mutateAsync({
        community_id: selectedCommunityId,
        name,
        description,
        price: priceNumber,
        interval,
        features,
      });

      toast({
        title: "Success",
        description: "Plan created successfully!",
      });

      onOpenChange(false);
      setName("");
      setDescription("");
      setPrice("");
      setInterval("monthly");
      setFeatures([]);
      setNewFeature("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to create plan.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Subscription Plan</DialogTitle>
          <DialogDescription>
            Create a new subscription plan for your community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interval">Interval</Label>
            <Select value={interval} onValueChange={(value) => setInterval(value as "monthly" | "quarterly" | "half-yearly" | "yearly" | "one-time")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="half-yearly">Half Yearly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="one-time">One Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Features</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddFeature}>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((feature, index) => (
                <Badge key={index} variant="secondary">
                  {feature}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-2 -mr-1"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
