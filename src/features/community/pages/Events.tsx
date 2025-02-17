import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import { CalendarDays, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Events = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: events, isLoading, refetch } = useEvents(selectedCommunityId || "");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (events) {
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
      const filtered = events.filter(event => {
        const eventDate = format(new Date(event.created_at), 'yyyy-MM-dd');
        const matchesDate = formattedDate ? eventDate === formattedDate : true;
        const matchesSearch = event.event_type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDate && matchesSearch;
      });
      setFilteredEvents(filtered);
    }
  }, [events, date, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Monitor community events and track user activity
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) =>
                date > new Date() || date < new Date("2023-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <Table>
        <TableCaption>A list of your recent events.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEvents.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{format(new Date(event.created_at), "PPP")}</TableCell>
              <TableCell>{event.event_type}</TableCell>
              <TableCell>{event.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Events;
