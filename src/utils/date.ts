
export function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
