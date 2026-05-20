import { User } from './user';

export type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: number;
  assignedToId?: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  assignedTo?: User;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface UpdateTicketData {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: number | null;
}

export interface Comment {
  id: number;
  content: string;
  ticketId: number;
  authorId: number;
  author: User;
  createdAt: string;
  updatedAt: string;
}
