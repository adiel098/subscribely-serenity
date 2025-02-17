
import { AppSidebar } from "./AppSidebar";
import { CommunitySelector } from "./CommunitySelector";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { selectedCommunityId, setSelectedCommunityId } = useCommunityContext();

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <CommunitySelector
            selectedCommunityId={selectedCommunityId || ""}
            onSelect={(id) => setSelectedCommunityId(id)}
          />
          <main className="mt-4">{children}</main>
        </div>
      </div>
    </div>
  );
};
