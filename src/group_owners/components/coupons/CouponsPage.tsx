import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, TagIcon } from "lucide-react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useCoupons } from "@/group_owners/hooks/coupon/useCoupons";
import { Coupon, CreateCouponData, UpdateCouponData } from "@/group_owners/hooks/types/coupon.types";
import { CouponCard } from "./CouponCard";
import { CreateCouponDialog } from "./CreateCouponDialog";
import { EditCouponDialog } from "./EditCouponDialog";
import { EmptyCouponsState } from "./EmptyCouponsState";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/ui/page-header";

export const CouponsPage = () => {
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const { toast } = useToast();
  const entityId = isGroupSelected ? selectedGroupId : selectedCommunityId;
  
  const { coupons, isLoading, createCoupon, updateCoupon, deleteCoupon } = useCoupons(entityId || "");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredCoupons = coupons?.filter(
    coupon => 
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coupon.description && coupon.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleCreateCoupon = async (data: CreateCouponData) => {
    try {
      setIsProcessing(true);
      console.log("Submitting coupon:", { ...data, community_id: entityId });
      
      await createCoupon.mutateAsync({
        ...data,
        community_id: entityId || ""
      });
      
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast({
        title: "Error",
        description: "Failed to create coupon. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setEditDialogOpen(true);
  };
  
  const handleUpdateCoupon = async (data: UpdateCouponData) => {
    if (!data.id) return;
    
    try {
      setIsProcessing(true);
      await updateCoupon.mutateAsync(data);
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast({
        title: "Error",
        description: "Failed to update coupon. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteConfirm = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;
    
    try {
      setIsProcessing(true);
      await deleteCoupon.mutateAsync(selectedCoupon.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast({
        title: "Error",
        description: "Failed to delete coupon. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!entityId) {
    return (
      <>
        <PageHeader 
          title="Discount Coupons" 
          description="Create and manage discount codes for your subscribers"
          icon={<TagIcon />}
        />
        <EmptyCouponsState 
          title={`Select a ${isGroupSelected ? 'group' : 'community'} to manage coupons`}
          description={`Choose a ${isGroupSelected ? 'group' : 'community'} from the dropdown above to start managing coupons.`}
        />
      </>
    );
  }
  
  if (isLoading) {
    return (
      <>
        <PageHeader 
          title="Discount Coupons" 
          description="Create and manage discount codes for your subscribers"
          icon={<TagIcon />}
        />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      </>
    );
  }

  const hasCoupons = filteredCoupons && filteredCoupons.length > 0;
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Discount Coupons" 
        description="Create and manage discount codes for your subscribers"
        icon={<TagIcon />}
      />
      
      {hasCoupons && (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </div>
          
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-full md:w-auto"
            disabled={isProcessing}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      )}
      
      {!hasCoupons ? (
        <EmptyCouponsState
          title="No coupons found"
          description="Create your first coupon to start offering discounts."
          icon={<TagIcon className="h-12 w-12" />}
          showCreateButton
          onCreateClick={() => setCreateDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons?.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onEdit={() => handleEditCoupon(coupon)}
              onDelete={() => handleDeleteConfirm(coupon)}
            />
          ))}
        </div>
      )}
      
      <CreateCouponDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateCoupon}
        isProcessing={isProcessing}
        communityId={entityId}
      />
      
      {selectedCoupon && (
        <EditCouponDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          coupon={selectedCoupon}
          onSubmit={handleUpdateCoupon}
          isProcessing={isProcessing}
        />
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the coupon
              and remove it from any active subscriptions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCoupon}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CouponsPage;
