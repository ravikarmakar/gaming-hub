import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

export const getErrorMessage = (error: unknown, defaultMsg: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || defaultMsg || "An error occurred";
  }
  return (error as Error).message || defaultMsg || "An error occurred";
};

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let lastRan: number;
  let lastFunc: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: Parameters<T>) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB');
};

/**
 * Formats a date or ISO string to the local datetime-local input format (YYYY-MM-DDTHH:mm)
 */
export const formatDateToLocalHTML = (date: string | Date | undefined) => {
  if (!date) return "";
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const offset = d.getTimezoneOffset() * 60000;
  const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
  return localISOTime;
};

export const formatCurrency = (amount: number | string | undefined) => {
  if (amount === undefined || amount === null) return "0";
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  return num.toLocaleString('en-IN');
};
