
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,  
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { MoreHorizontal, Search, RefreshCw, UserPlus } from "lucide-react";
import { useState } from "react";

// Mock data for users
const mockUsers = [
  {
    id: "1",
    name: "דני כהן",
    email: "dani.cohen@example.com",
    communitiesCount: 2,
    subscription: "premium",
    membersSince: "2023-05-12",
    status: "active",
    photoUrl: null
  },
  {
    id: "2",
    name: "רותם לוי",
    email: "rotem.levy@example.com",
    communitiesCount: 3,
    subscription: "premium",
    membersSince: "2023-02-28",
    status: "active",
    photoUrl: null
  },
  {
    id: "3",
    name: "חיים גולדברג",
    email: "haim.gold@example.com",
    communitiesCount: 1,
    subscription: "basic",
    membersSince: "2023-08-05",
    status: "inactive",
    photoUrl: null
  },
  {
    id: "4",
    name: "שירה אהרוני",
    email: "shira.a@example.com",
    communitiesCount: 1,
    subscription: "premium",
    membersSince: "2023-04-19",
    status: "active",
    photoUrl: null
  },
  {
    id: "5",
    name: "יעל שטרן",
    email: "yael.stern@example.com",
    communitiesCount: 1,
    subscription: "basic",
    membersSince: "2023-09-15",
    status: "suspended",
    photoUrl: null
  }
];

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredUsers = mockUsers.filter(
    user => user.name.includes(searchTerm) || 
           user.email.includes(searchTerm)
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL').format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">פעיל</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">לא פעיל</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">מושהה</Badge>;
      default:
        return <Badge variant="outline">לא ידוע</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case "premium":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">פרימיום</Badge>;
      case "basic":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">בסיסי</Badge>;
      default:
        return <Badge variant="outline">לא ידוע</Badge>;
    }
  };

  return (
    <div className="space-y-6 rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ניהול משתמשים</h1>
          <p className="text-muted-foreground">
            ניהול בעלי קהילות ומשתמשים
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          משתמש חדש
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם משתמש או אימייל..."
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
              <TableHead className="w-[250px]">משתמש</TableHead>
              <TableHead>אימייל</TableHead>
              <TableHead className="text-center">קהילות</TableHead>
              <TableHead className="text-center">חבילה</TableHead>
              <TableHead className="text-center">תאריך הצטרפות</TableHead>
              <TableHead className="text-center">סטטוס</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      {user.photoUrl ? (
                        <AvatarImage src={user.photoUrl} alt={user.name} />
                      ) : (
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="mr-2">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-center">{user.communitiesCount}</TableCell>
                <TableCell className="text-center">{getSubscriptionBadge(user.subscription)}</TableCell>
                <TableCell className="text-center">{formatDate(user.membersSince)}</TableCell>
                <TableCell className="text-center">{getStatusBadge(user.status)}</TableCell>
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
                      <DropdownMenuItem>צפה בקהילות</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === "active" ? (
                        <DropdownMenuItem className="text-amber-600">השהה משתמש</DropdownMenuItem>
                      ) : user.status === "suspended" ? (
                        <DropdownMenuItem className="text-green-600">שחרר השהייה</DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="text-red-600">מחק משתמש</DropdownMenuItem>
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
