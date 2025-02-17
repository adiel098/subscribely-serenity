import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/features/community/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/community/components/ui/card";
import { Input } from "@/features/community/components/ui/input";
import { Label } from "@/features/community/components/ui/label";
import { Button } from "@/features/community/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/community/components/ui/table"
import { useCommunityContext } from '@/features/community/providers/CommunityContext';
import { useSubscribers, Subscriber } from "@/hooks/community/useSubscribers";
import { Calendar } from "@/features/community/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/features/community/components/ui/popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ArrowDownToLine } from "lucide-react";
import { DateRange } from "react-day-picker";

const generateCSV = (data: Subscriber[]) => {
  const header = Object.keys(data[0] || {}).join(',');
  const rows = data.map(item => Object.values(item).map(value => {
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(','));
  return `${header}\n${rows.join('\n')}`;
};

const Subscribers = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { selectedCommunityId } = useCommunityContext();
  const { data: subscribers, isLoading, error, refetch } = useSubscribers(selectedCommunityId || '');

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch subscribers"
      });
    }
  }, [error, toast]);

  const filteredSubscribers = useCallback(() => {
    if (!subscribers) return [];

    let filtered = [...subscribers];

    if (searchQuery) {
      filtered = filtered.filter(subscriber =>
        subscriber.telegram_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscriber.telegram_user_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(subscriber => {
        const joinedAt = new Date(subscriber.joined_at);
        return joinedAt >= dateRange.from! && joinedAt <= dateRange.to!;
      });
    }

    return filtered;
  }, [subscribers, searchQuery, dateRange]);

  const handleExport = () => {
    const csvContent = generateCSV(subscribers || []);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    if (window.navigator && ('msSaveBlob' in window.navigator)) {
      // עבור דפדפני IE
      (window.navigator as any).msSaveBlob(blob, 'subscribers.csv');
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'subscribers.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="container max-w-7xl py-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscribers</h1>
        <p className="text-sm text-muted-foreground">
          Manage your community subscribers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter subscribers by username and date</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                type="search"
                id="search"
                placeholder="Search by username or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "LLL dd, y")} - ${format(
                          dateRange.to,
                          "LLL dd, y"
                        )}`
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('2023-01-01')
                    }
                    numberOfMonths={2}
                    pagedNavigation
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscribers List</CardTitle>
          <CardDescription>
            All subscribers in your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading subscribers...</div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableCaption>A list of your community subscribers.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Subscription Status</TableHead>
                    <TableHead>Plan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers().map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.telegram_user_id}</TableCell>
                      <TableCell>{subscriber.telegram_username || 'N/A'}</TableCell>
                      <TableCell>{new Date(subscriber.joined_at).toLocaleDateString()}</TableCell>
                      <TableCell>{subscriber.subscription_status ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>{subscriber.plan?.name || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5}>
                      {filteredSubscribers().length} Total subscribers
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleExport} className="gap-2">
        <ArrowDownToLine className="h-4 w-4" />
        Export to CSV
      </Button>
    </div>
  );
};

export default Subscribers;
