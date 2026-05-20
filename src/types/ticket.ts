import { User } from './user';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string;
  assignedToId?: string | null;
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
  assignedToId?: string | null;
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
