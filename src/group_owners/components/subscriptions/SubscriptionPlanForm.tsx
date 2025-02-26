
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export const SubscriptionPlanForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    interval: "monthly",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add form submission logic here
  };

  return (
    <Card className="p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Plan Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter plan name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="Enter price"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Interval</label>
          <Select
            value={formData.interval}
            onValueChange={(value) => setFormData({ ...formData, interval: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="one-time">One Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Create Plan</Button>
      </form>
    </Card>
  );
};

