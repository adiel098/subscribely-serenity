
import { AppSidebar } from "./AppSidebar";
import { CommunitySelector } from "./CommunitySelector";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import type { CommunitySelectorProps } from "@/types";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { selectedCommunityId, setSelectedCommunityId } = useCommunityContext();

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <CommunitySelector
            selectedCommunityId={selectedCommunityId || ""}
            onSelect={setSelectedCommunityId}
          />
          <main className="mt-4">{children}</main>
        </div>
      </div>
    </div>
  );
};
