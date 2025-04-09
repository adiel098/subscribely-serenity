
import { useNavigate } from "react-router-dom";
import { UserButton } from "@/auth/components/UserButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { CommunitySelector } from "./CommunitySelector";
import { ProjectSelector } from "./ProjectSelector";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MobileSidebar } from "./MobileSidebar";

export function GroupOwnerHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center gap-4 border-b bg-gradient-to-b from-background/10 via-background/80 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      {isMobile && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className="flex md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetContent side="left" className="p-0 pt-10">
              <MobileSidebar onClose={() => setIsMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </>
      )}

      <div className="flex items-center gap-2">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white font-semibold">
            M
          </div>
          {!isMobile && <span className="text-lg font-semibold">Membify</span>}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <ProjectSelector />
        <CommunitySelector />
        <UserButton />
      </div>
    </header>
  );
}
