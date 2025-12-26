import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string or Date object to a readable format
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Never"
  
  const dateObj = typeof date === "string" ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return "Invalid date"
  
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj)
}

