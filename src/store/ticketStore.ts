import { create } from 'zustand';
import { Ticket } from '../types/ticket';
import { getTickets } from '../services/ticketService';

interface TicketState {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
  fetchTickets: (params?: Record<string, any>) => Promise<void>;
  addTicket: (ticket: Ticket) => void;
  updateTicketInStore: (ticket: Ticket) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: [],
  isLoading: false,
  error: null,
  fetchTickets: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const tickets = await getTickets(params);
      set({ tickets, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  addTicket: (ticket) => set((state) => ({ tickets: [ticket, ...state.tickets] })),
  updateTicketInStore: (updatedTicket) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
    })),
}));
