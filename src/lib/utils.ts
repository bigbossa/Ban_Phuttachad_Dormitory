import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a random receipt number with format: RCP-YYYYMMDD-XXXXX
 * Where:
 * - RCP: Fixed prefix
 * - YYYYMMDD: Current date
 * - XXXXX: 5 random digits
 */
export function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate 5 random digits
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  
  return `RCP-${year}${month}${day}-${random}`;
}
