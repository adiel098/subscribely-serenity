import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';

const Analytics = () => {
  const { user } = useAuth();

  return (
    <div className="h-full space-y-6 py-[5px] px-[14px]">
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Track your community's growth and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            {user?.email}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
