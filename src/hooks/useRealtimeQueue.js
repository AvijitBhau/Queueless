import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtimeQueue(eventId, onUpdate) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`queue-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          onUpdate && onUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          onUpdate && onUpdate(payload);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return channelRef;
}

export function useRealtimeTicket(ticketId, onUpdate) {
  useEffect(() => {
    if (!ticketId) return;

    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`,
        },
        (payload) => {
          onUpdate && onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);
}
