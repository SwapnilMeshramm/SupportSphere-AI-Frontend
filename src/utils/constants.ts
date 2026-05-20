export const APP_NAME = 'SupportSphere AI';

export const TICKET_STATUSES = ['Open', 'InProgress', 'Resolved', 'Closed'] as const;
export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
export const USER_ROLES = ['Admin', 'SupportAgent', 'Customer'] as const;

export const STATUS_LABELS: Record<string, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  Resolved: 'Resolved',
  Closed: 'Closed',
};

export const PRIORITY_LABELS: Record<string, string> = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Urgent: 'Urgent',
};
