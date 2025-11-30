import { ItineraryItem, Announcement, TransportationEvent } from '../types';

const API_BASE = '/api';

export const api = {
    itinerary: {
        list: async (): Promise<ItineraryItem[]> => {
            const res = await fetch(`${API_BASE}/itinerary`);
            if (!res.ok) throw new Error('Failed to fetch itinerary');
            return res.json();
        },
        create: async (item: ItineraryItem): Promise<ItineraryItem> => {
            const res = await fetch(`${API_BASE}/itinerary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (!res.ok) throw new Error('Failed to create itinerary item');
            return res.json();
        },
        update: async (item: ItineraryItem): Promise<ItineraryItem> => {
            const res = await fetch(`${API_BASE}/itinerary/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (!res.ok) throw new Error('Failed to update itinerary item');
            return res.json();
        },
        delete: async (id: string): Promise<void> => {
            const res = await fetch(`${API_BASE}/itinerary/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete itinerary item');
        },
    },
    announcements: {
        list: async (): Promise<Announcement[]> => {
            const res = await fetch(`${API_BASE}/announcements`);
            if (!res.ok) throw new Error('Failed to fetch announcements');
            return res.json();
        },
        create: async (item: Announcement): Promise<Announcement> => {
            const res = await fetch(`${API_BASE}/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (!res.ok) throw new Error('Failed to create announcement');
            return res.json();
        },
        update: async (item: Announcement): Promise<Announcement> => {
            const res = await fetch(`${API_BASE}/announcements/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (!res.ok) throw new Error('Failed to update announcement');
            return res.json();
        },
        delete: async (id: string): Promise<void> => {
            const res = await fetch(`${API_BASE}/announcements/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete announcement');
        },
    },
    transportations: {
        list: async (): Promise<TransportationEvent[]> => {
            const res = await fetch(`${API_BASE}/transportations`);
            if (!res.ok) throw new Error('Failed to fetch transportations');
            return res.json();
        },
        create: async (item: TransportationEvent): Promise<TransportationEvent> => {
            const res = await fetch(`${API_BASE}/transportations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (!res.ok) throw new Error('Failed to create transportation');
            return res.json();
        },
        update: async (item: TransportationEvent): Promise<TransportationEvent> => {
            const res = await fetch(`${API_BASE}/transportations/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (!res.ok) throw new Error('Failed to update transportation');
            return res.json();
        },
        delete: async (id: string): Promise<void> => {
            const res = await fetch(`${API_BASE}/transportations/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete transportation');
        },
    },
};
