import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { Textarea } from "@/components/ui/textarea";

interface EditPlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editPlanData: {
    id: string;
    name: string;
    description: string;
    price: string;
    interval: string;
    features: string[];
  };
}

export const EditPlanDialog = ({
  isOpen,
  onOpenChange,
  editPlanData
}: EditPlanDialogProps) => {
  const { toast } = useToast();
  const { updatePlan } = useSubscriptionPlans(editPlanData.id);
  const [name, setName] = useState(editPlanData.name);
  const [description, setDescription] = useState(editPlanData.description);
  const [price, setPrice] = useState(editPlanData.price);
  const [interval, setInterval] = useState(editPlanData.interval);
  const [features, setFeatures] = useState<string[]>(editPlanData.features || []);
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    setName(editPlanData.name);
    setDescription(editPlanData.description);
    setPrice(editPlanData.price);
    setInterval(editPlanData.interval);
    setFeatures(editPlanData.features || []);
  }, [editPlanData]);

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

    try {
      const priceNumber = parseFloat(price);
      if (isNaN(priceNumber) || priceNumber <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Price must be a valid positive number",
        });
        return;
      }

      await updatePlan.mutateAsync({
        id: editPlanData.id,
        name,
        description,
        price: priceNumber,
        interval,
        features,
      });

      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update plan",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription Plan</DialogTitle>
          <DialogDescription>
            Make changes to your subscription plan here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interval">Interval</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger>
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
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Add a feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddFeature}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            {features.map((feature, index) => (
              <Badge key={index} className="mr-2 my-1">
                {feature}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-2 -mr-1"
                  onClick={() => handleRemoveFeature(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Badge>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
