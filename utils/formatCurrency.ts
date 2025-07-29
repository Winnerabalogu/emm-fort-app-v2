/* eslint-disable @typescript-eslint/no-unused-vars */
// utils/formatCurrency.ts

/**
 * Formats a number as Nigerian Naira (NGN).
 * Handles null, undefined, or non-numeric inputs gracefully.
 *
 * @param amount - The number to format.
 * @returns 
 */
export function formatNaira(amount: number | null | undefined): string {
  // Check for null, undefined, or non-numeric types
  if (amount == null || typeof amount !== 'number' || isNaN(amount)) {
    return 'N0.00'; // Return a default placeholder
  }

  const formattedAmount = amount.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // The 'en-NG' locale might add NGN prefix, we only want the 'N' symbol.
  // We can replace it or simply use a more generic locale.
  // Using 'en-US' with a manual symbol is often more reliable.

  const usFormatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
  });

  return `N${usFormatted}`;
}