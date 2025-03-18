
interface SubscribersCountDisplayProps {
  filteredCount: number;
  totalCount: number;
}

export const SubscribersCountDisplay = ({ filteredCount, totalCount }: SubscribersCountDisplayProps) => {
  if (filteredCount === 0) return null;
  
  return (
    <div className="text-center pt-2">
      <p className="text-sm text-gray-500">
        Showing {filteredCount} of {totalCount} total subscribers
      </p>
    </div>
  );
};
