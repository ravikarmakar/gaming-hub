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
