import { ReactNode } from 'react';

export interface ServiceType {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
  index?: number;
  features?: string[];
}
