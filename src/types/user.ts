export type Role = 'Admin' | 'SupportAgent' | 'Customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'TicketCreated'
  | 'TicketAssigned'
  | 'StatusChanged'
  | 'NewReply'
  | 'TicketUpdated'
  | 'PriorityChanged';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  userId: number;
  ticketId: number | null;
  read: boolean;
  createdAt: string;
}
