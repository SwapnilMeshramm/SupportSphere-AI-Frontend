'use client';

import { useEffect } from 'react';
import { useTicketStore } from '../store/ticketStore';

export function useTickets(params?: Record<string, any>) {
  const { tickets, isLoading, error, fetchTickets } = useTicketStore();

  useEffect(() => {
    fetchTickets(params);
  }, []);

  return { tickets, isLoading, error, refetch: fetchTickets };
}
