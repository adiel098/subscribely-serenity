
import { useState } from "react";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useCommunities } from "@/hooks/useCommunities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, TrashIcon, CheckIcon, EditIcon, SparklesIcon, CrownIcon, StarIcon, ZapIcon } from "lucide-react";
import { toast } from "sonner";
import { useCommunityContext } from "@/App";

type IntervalType = "monthly" | "quarterly" | "half-yearly" | "yearly" | "one-time";

const intervalColors = {
  monthly: "from-blue-50 to-blue-100 border-blue-200",
  quarterly: "from-green-50 to-green-100 border-green-200",
  "half-yearly": "from-purple-50 to-purple-100 border-purple-200",
  yearly: "from-orange-50 to-orange-100 border-orange-200",
  "one-time": "from-pink-50 to-pink-100 border-pink-200"
};

const intervalLabels = {
  monthly: "חודשי",
  quarterly: "רבעוני",
  "half-yearly": "חצי שנתי",
  yearly: "שנתי",
  "one-time": "חד פעמי"
};

const Subscriptions = () => {
  const { data: communities } = useCommunities();
  const { selectedCommunityId } = useCommunityContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly" as IntervalType,
    features: [] as string[]
  });

  const {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan
  } = useSubscriptionPlans(selectedCommunityId ?? "");

  const handleCreatePlan = async () => {
    if (!selectedCommunityId) {
      toast.error("Please select a community");
      return;
    }
    try {
      await createPlan.mutateAsync({
        community_id: selectedCommunityId,
        name: newPlan.name,
        description: newPlan.description,
        price: parseFloat(newPlan.price),
        interval: newPlan.interval,
        features: newPlan.features
      });
      setIsCreateDialogOpen(false);
      setNewPlan({
        name: "",
        description: "",
        price: "",
        interval: "monthly",
        features: []
      });
      toast.success("Plan created successfully! ✨");
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error("Failed to create plan");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm("Are you sure you want to delete this subscription plan?")) {
      try {
        await deletePlan.mutateAsync(planId);
        toast.success("Plan deleted successfully! 🗑️");
      } catch (error) {
        console.error("Error deleting plan:", error);
        toast.error("Failed to delete plan");
      }
    }
  };

  const [newFeature, setNewFeature] = useState("");
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setNewPlan(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!selectedCommunityId) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <CrownIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-gray-600">Select a community to view subscription plans</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-12 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <CrownIcon className="h-10 w-10 text-yellow-500" />
            תוכניות מנוי
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            צור ונהל תוכניות מנוי עבור חברי הקהילה שלך ✨
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {plans?.map((plan, index) => (
          <Card
            key={plan.id}
            className={`group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 animate-fade-in bg-gradient-to-br h-full flex flex-col ${intervalColors[plan.interval as IntervalType]}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 to-primary"></div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {plan.name}
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                  </h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 text-lg">
                      {plan.interval === "one-time" ? "" : `/ ${intervalLabels[plan.interval as IntervalType]}`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50/80"
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50/80"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {plan.description && (
                <p className="text-gray-600 leading-relaxed mt-4">{plan.description}</p>
              )}
              
              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-4 mt-6 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <span className="text-gray-700 leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6">
                <Button 
                  className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300" 
                  size="lg"
                >
                  <ZapIcon className="h-5 w-5" />
                  בחר תוכנית
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Card className="h-full group cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary/50 transition-all duration-300 flex items-center justify-center bg-white/50 hover:bg-primary/5">
              <div className="text-center space-y-4 p-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                  <PlusIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">הוסף תוכנית חדשה</p>
                  <p className="text-sm text-gray-500 mt-1">לחץ להוספת תוכנית מנוי</p>
                </div>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] p-6">
            <DialogHeader className="space-y-3 pb-6">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-primary" />
                יצירת תוכנית מנוי חדשה
              </DialogTitle>
              <p className="text-gray-600">
                עצב תוכנית מנוי חדשה להציע לחברי הקהילה שלך הטבות בלעדיות
              </p>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-base">שם התוכנית</Label>
                <Input 
                  id="name" 
                  placeholder='לדוגמא: "תוכנית פרימיום"' 
                  value={newPlan.name}
                  onChange={e => setNewPlan(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="text-lg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-base">תיאור</Label>
                <Textarea 
                  id="description" 
                  placeholder="תאר את ההטבות הבלעדיות של התוכנית..." 
                  value={newPlan.description}
                  onChange={e => setNewPlan(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="min-h-[100px] text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-base">מחיר</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    value={newPlan.price}
                    onChange={e => setNewPlan(prev => ({
                      ...prev,
                      price: e.target.value
                    }))}
                    className="text-lg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interval" className="text-base">תקופת חיוב</Label>
                  <Select 
                    value={newPlan.interval}
                    onValueChange={(value: IntervalType) => setNewPlan(prev => ({
                      ...prev,
                      interval: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">חודשי</SelectItem>
                      <SelectItem value="quarterly">רבעוני</SelectItem>
                      <SelectItem value="half-yearly">חצי שנתי</SelectItem>
                      <SelectItem value="yearly">שנתי</SelectItem>
                      <SelectItem value="one-time">חד פעמי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4">
                <Label className="text-base">יתרונות</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="הוסף יתרון..."
                    value={newFeature}
                    onChange={e => setNewFeature(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && handleAddFeature()}
                  />
                  <Button onClick={handleAddFeature}>הוסף</Button>
                </div>
                <ul className="space-y-2">
                  {newPlan.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(index)}
                        className="hover:bg-red-50 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleCreatePlan} className="gap-2">
                <SparklesIcon className="h-4 w-4" />
                צור תוכנית
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Subscriptions;
