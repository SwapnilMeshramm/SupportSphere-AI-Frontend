import api from "./api";
import { Ticket, CreateTicketData, UpdateTicketData, Comment } from "../types/ticket";

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  activeAgents: number;
}

export const getTickets = async (
  params?: Record<string, any>,
): Promise<Ticket[]> => {
  const response = await api.get("/tickets", { params });
  return response.data.data.tickets;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/tickets/stats");
  return response.data.data.stats;
};

export const getTicketById = async (id: string | number): Promise<Ticket> => {
  const response = await api.get(`/tickets/${id}`);
  return response.data.data.ticket;
};

export const createTicket = async (data: CreateTicketData): Promise<Ticket> => {
  const response = await api.post("/tickets", data);
  return response.data.data.ticket;
};

export const updateTicket = async (
  id: string | number,
  data: UpdateTicketData,
): Promise<Ticket> => {
  const response = await api.put(`/tickets/${id}`, data);
  return response.data.data.ticket;
};

export const deleteTicket = async (id: string | number): Promise<void> => {
  await api.delete(`/tickets/${id}`);
};

export const getTicketComments = async (id: string | number): Promise<Comment[]> => {
  const response = await api.get(`/tickets/${id}/comments`);
  return response.data.data.comments;
};

export const addComment = async (id: string | number, content: string): Promise<Comment> => {
  const response = await api.post(`/tickets/${id}/comments`, { content });
  return response.data.data.comment;
};

export const assignTicket = async (id: string | number, assignedToId: number | null): Promise<Ticket> => {
  const response = await api.patch(`/tickets/${id}/assign`, { assignedToId });
  return response.data.data.ticket;
};

export const updateTicketStatus = async (id: string | number, status: string): Promise<Ticket> => {
  const response = await api.patch(`/tickets/${id}/status`, { status });
  return response.data.data.ticket;
};

export const updateTicketPriority = async (id: string | number, priority: string): Promise<Ticket> => {
  const response = await api.patch(`/tickets/${id}/priority`, { priority });
  return response.data.data.ticket;
};
