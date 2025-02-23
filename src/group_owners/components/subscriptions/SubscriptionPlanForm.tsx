
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plan } from "@/types/subscription"
import { useState } from "react"

interface SubscriptionPlanFormProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (data: any) => void
  isLoading: boolean
  plan?: Plan | null
  communityId: string
}

export function SubscriptionPlanForm({
  open,
  setOpen,
  onSubmit,
  isLoading,
  plan,
  communityId
}: SubscriptionPlanFormProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    price: plan?.price || "",
    interval: plan?.interval || "monthly",
    features: plan?.features || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      id: plan?.id,
      community_id: communityId
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter plan name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter plan description"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price</label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Enter price"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Billing Interval</label>
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
                <SelectItem value="half-yearly">Half Yearly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="one-time">One Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : plan ? "Update Plan" : "Create Plan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
