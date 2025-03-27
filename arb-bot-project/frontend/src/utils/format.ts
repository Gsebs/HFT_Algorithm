/**
 * Format a number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as currency with more precision for crypto
 */
export function formatCryptoCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value / 100);
}

/**
 * Format a timestamp as localized date and time
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Format a timestamp as localized time only
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString();
}

/**
 * Format a number with commas as thousands separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
