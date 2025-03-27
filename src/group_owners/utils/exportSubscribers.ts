
import { Subscriber } from "../hooks/useSubscribers";

export const exportSubscribersToCSV = (subscribers: Subscriber[]) => {
  const exportData = subscribers.map(sub => ({
    Username: sub.telegram_username || 'No username',
    'Telegram ID': sub.telegram_user_id || '',
    'Plan Name': sub.plan?.name || 'No plan',
    'Plan Price': sub.plan ? `$${sub.plan.price}` : '-',
    'Plan Interval': sub.plan?.interval || '-',
    Status: sub.subscription_status,
    'Start Date': sub.subscription_start_date ? new Date(sub.subscription_start_date).toLocaleDateString() : '-',
    'End Date': sub.subscription_end_date ? new Date(sub.subscription_end_date).toLocaleDateString() : '-',
    'Joined At': new Date(sub.joined_at || '').toLocaleDateString(),
  }));

  const headers = Object.keys(exportData[0]);
  const csvRows = [
    headers.join(','),
    ...exportData.map(row => 
      headers.map(header => 
        JSON.stringify(row[header as keyof typeof row])).join(',')
    )
  ];
  const csvString = csvRows.join('\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'subscribers.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  return true;
};
