
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useAdminPermission } from "@/admin/hooks/useAdminPermission";

export default function Index() {
  const { user } = useAuth();
  const { isAdmin } = useAdminPermission();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Membify - פלטפורמה לניהול קהילות בטלגרם
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          נהל את הקהילות שלך, עקוב אחר מנויים ותשלומים, ואפשר גישה אוטומטית לקבוצות.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {user ? (
            <>
              <Button asChild size="lg" className="text-lg">
                <Link to="/dashboard">
                  למרחב העבודה שלי
                </Link>
              </Button>
              
              {isAdmin && (
                <Button asChild variant="outline" size="lg" className="text-lg">
                  <Link to="/admin/dashboard">
                    פאנל אדמין
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button asChild size="lg" className="text-lg">
                <Link to="/auth">
                  התחברות
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="text-lg">
                <a href="https://t.me/membifybot" target="_blank" rel="noopener noreferrer">
                  בוט טלגרם
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
