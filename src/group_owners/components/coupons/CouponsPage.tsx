
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

export const CouponsPage = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { toast } = useToast();
  const communityId = selectedCommunityId || "";
  
  const { coupons, isLoading, createCoupon, updateCoupon, deleteCoupon } = useCoupons(communityId);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Filter coupons based on search query
  const filteredCoupons = coupons?.filter(
    coupon => 
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coupon.description && coupon.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleCreateCoupon = async (data: CreateCouponData) => {
    try {
      setIsProcessing(true);
      console.log("Submitting coupon:", { ...data, community_id: communityId });
      
      await createCoupon.mutateAsync({
        ...data,
        community_id: communityId
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
  
  if (!communityId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Select a community to manage coupons</p>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TagIcon className="h-6 w-6 text-indigo-500" />
            Discount Coupons
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage discount coupons for your subscribers
          </p>
        </div>
        {coupons && coupons.length > 0 && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4" />
            Create Coupon
          </Button>
        )}
      </div>
      
      {coupons && coupons.length > 0 ? (
        <>
          <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoupons?.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={handleEditCoupon}
                onDelete={handleDeleteConfirm}
              />
            ))}
          </div>
        </>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading coupons...</p>
        </div>
      ) : (
        <EmptyCouponsState onCreateCoupon={() => setCreateDialogOpen(true)} />
      )}
      
      <CreateCouponDialog
        communityId={communityId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateCoupon}
      />
      
      {selectedCoupon && (
        <EditCouponDialog
          coupon={selectedCoupon}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleUpdateCoupon}
        />
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the coupon{" "}
              <span className="font-semibold">{selectedCoupon?.code}</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCoupon}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing || deleteCoupon.isPending}
            >
              {isProcessing || deleteCoupon.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
