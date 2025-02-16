import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { CommunitySelector } from "@/components/CommunitySelector";
export const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return <div className="min-h-screen w-full">
      <Navbar />
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] mt-16">
          <CommunitySelector />
          <div className="min-h-full w-full bg-gray-50 p-8 mt-[4.5rem] pl-[280px] my-[22px] py-0 px-0">
            {children}
          </div>
        </main>
      </div>
    </div>;
};