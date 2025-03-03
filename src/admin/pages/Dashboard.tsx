
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, DollarSign, Globe, Users } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6 rtl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">דשבורד</h1>
        <p className="text-muted-foreground">
          סקירה כללית וניטור נתונים של הפלטפורמה.
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="analytics">פעילות</TabsTrigger>
          <TabsTrigger value="reports">דוחות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  סה״כ קהילות
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +2 בחודש האחרון
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  סה״כ משתמשים
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,453</div>
                <p className="text-xs text-muted-foreground">
                  +124 בחודש האחרון
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  הכנסות
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,234</div>
                <p className="text-xs text-muted-foreground">
                  +3.1% מהחודש הקודם
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  רשומים חדשים
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +201 מהחודש הקודם
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>סקירת הכנסות</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                  גרף יוצג כאן
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>פעילות אחרונה</CardTitle>
                <CardDescription>
                  5 פעולות אחרונות במערכת
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0">
                      <Avatar>
                        <AvatarFallback>{`U${i+1}`}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">משתמש נרשם לקהילה</p>
                        <p className="text-xs text-muted-foreground">לפני {i+1} שעות</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>פעילות משתמשים</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                נתוני פעילות יוצגו כאן
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>דוחות ונתונים</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                דוחות יוצגו כאן
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Import missing Avatar components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
