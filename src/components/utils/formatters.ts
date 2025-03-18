// utils/formatters.ts

/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  /**
   * Format a number as a percentage with 2 decimal places
   */
  export const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };