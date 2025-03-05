
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ReportsTabContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports & Data</CardTitle>
        <CardDescription>View and export detailed platform reports 📋</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <div className="h-full w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
          <p className="text-muted-foreground">Reports will be displayed here</p>
        </div>
      </CardContent>
    </Card>
  );
};
