
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Search, Plus, Users, RefreshCw } from "lucide-react";
import { useState } from "react";

// Mock data for communities
const mockCommunities = [
  {
    id: "1",
    name: "קהילת הסוחרים",
    owner: "דני כהן",
    members: 128,
    subscriptions: 98,
    revenue: 4900,
    status: "active",
    photoUrl: null
  },
  {
    id: "2",
    name: "קהילת המתכנתים",
    owner: "רותם לוי",
    members: 345,
    subscriptions: 290,
    revenue: 14500,
    status: "active",
    photoUrl: null
  },
  {
    id: "3",
    name: "קבוצת ההשקעות",
    owner: "חיים גולדברג",
    members: 76,
    subscriptions: 61,
    revenue: 3050,
    status: "suspended",
    photoUrl: null
  },
  {
    id: "4",
    name: "מועדון הספורט",
    owner: "שירה אהרוני",
    members: 210,
    subscriptions: 190,
    revenue: 9500,
    status: "active",
    photoUrl: null
  },
  {
    id: "5",
    name: "קהילת הספרות",
    owner: "יעל שטרן",
    members: 42,
    subscriptions: 28,
    revenue: 1400,
    status: "inactive",
    photoUrl: null
  }
];

export default function AdminCommunities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredCommunities = mockCommunities.filter(
    community => community.name.includes(searchTerm) || 
                community.owner.includes(searchTerm)
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">פעילה</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">לא פעילה</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">מושהית</Badge>;
      default:
        return <Badge variant="outline">לא ידוע</Badge>;
    }
  };

  return (
    <div className="space-y-6 rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ניהול קהילות</h1>
          <p className="text-muted-foreground">
            ניהול כל הקהילות בפלטפורמה
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          קהילה חדשה
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם קהילה או בעלים..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          רענון נתונים
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">שם קהילה</TableHead>
              <TableHead>בעלים</TableHead>
              <TableHead className="text-center">חברים</TableHead>
              <TableHead className="text-center">מנויים</TableHead>
              <TableHead className="text-right">הכנסות</TableHead>
              <TableHead className="text-center">סטטוס</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCommunities.map((community) => (
              <TableRow key={community.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      {community.photoUrl ? (
                        <AvatarImage src={community.photoUrl} alt={community.name} />
                      ) : (
                        <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="mr-2">{community.name}</span>
                  </div>
                </TableCell>
                <TableCell>{community.owner}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    {community.members}
                  </div>
                </TableCell>
                <TableCell className="text-center">{community.subscriptions}</TableCell>
                <TableCell className="text-right">${community.revenue}</TableCell>
                <TableCell className="text-center">{getStatusBadge(community.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">פתח תפריט</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>פעולות</DropdownMenuLabel>
                      <DropdownMenuItem>צפה בפרטים</DropdownMenuItem>
                      <DropdownMenuItem>ערוך פרטים</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {community.status === "active" ? (
                        <DropdownMenuItem className="text-amber-600">השהה קהילה</DropdownMenuItem>
                      ) : community.status === "suspended" ? (
                        <DropdownMenuItem className="text-green-600">שחרר השהייה</DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="text-red-600">מחק קהילה</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
