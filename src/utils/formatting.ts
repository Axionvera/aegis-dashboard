/**
* Truncates a Stellar public key for UI display.
* e.g., GABCDE...WXYZ -> GABC...WXYZ
*/
export const truncateAddress = (address: string): string => {
if (!address || address.length < 12) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};

/**
 * Formats a raw number into a readable token amount.
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats an ISO timestamp for dashboard activity feeds.
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};