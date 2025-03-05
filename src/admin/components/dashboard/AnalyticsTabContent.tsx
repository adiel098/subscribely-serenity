
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const AnalyticsTabContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activities</CardTitle>
        <CardDescription>Track and analyze user behavior patterns 📈</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <div className="h-full w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
          <p className="text-muted-foreground">Analytics data will be displayed here</p>
        </div>
      </CardContent>
    </Card>
  );
};
