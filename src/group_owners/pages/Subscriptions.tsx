
import { columns } from "../components/subscriptions/columns";
import { SubscriptionPlanForm } from "../components/subscriptions/SubscriptionPlanForm";

const Subscriptions = () => {
  return (
    <div>
      <h1>Subscriptions Page</h1>
      <SubscriptionPlanForm />
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.accessorKey}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Data 1</td>
            <td>Data 2</td>
            <td>Data 3</td>
            <td>Data 4</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Subscriptions;

