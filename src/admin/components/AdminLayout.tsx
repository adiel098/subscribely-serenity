
import { AdminSidebar } from "@/admin/components/AdminSidebar";
import { AdminNavbar } from "@/admin/components/AdminNavbar";
import { ReactNode } from "react";

interface AdminLayoutProps {
  dashboard?: ReactNode;
}

export const AdminLayout = ({ dashboard }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen w-full">
      <AdminNavbar />
      <div className="flex w-full">
        <main className="flex-1 min-h-[calc(100vh-4rem)] mt-16">
          <div className="min-h-full w-full bg-gray-50 px-8 py-8 mt-[4.5rem] ml-[280px]">
            {dashboard}
          </div>
        </main>
        <AdminSidebar />
      </div>
    </div>
  );
};
