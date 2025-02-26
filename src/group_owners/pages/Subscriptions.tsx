
import { columns } from "../components/subscriptions/columns";
import { SubscriptionPlanForm } from "../components/subscriptions/SubscriptionPlanForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Subscriptions = () => {
  return (
    <div>
      <h1>Subscriptions Page</h1>
      <SubscriptionPlanForm />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{String(column.header)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Data 1</TableCell>
              <TableCell>Data 2</TableCell>
              <TableCell>Data 3</TableCell>
              <TableCell>Data 4</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Subscriptions;

