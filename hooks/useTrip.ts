import useSWR, { SWRConfiguration } from 'swr';
import { Trip, ItineraryItem, Announcement, TransportationEvent, SocialPost, Expense, DiscussionThread, ItineraryTemplate } from '../types';

interface TripData {
    tripId: string;
    itinerary?: ItineraryItem[];
    announcements?: Announcement[];
    transportations?: TransportationEvent[];
    socialPosts?: SocialPost[];
    expenses?: Expense[];
    discussionThreads?: DiscussionThread[];
    templates?: ItineraryTemplate[];
}

const fetcher = (url: string) => fetch(url).then(r => {
    if (!r.ok) throw new Error('Failed to fetch');
    return r.json();
});

export function useTrip(tripCode: string | undefined, options?: SWRConfiguration) {
    // 1. Fetch Trip Metadata
    const { data: trip, error: tripError, isLoading: isTripLoading } = useSWR<Trip>(
        tripCode ? `/api/trips/${tripCode}` : null,
        fetcher,
        options
    );

    // 2. Fetch Trip Data (only if trip exists)
    const { data: tripData, error: dataError, isLoading: isDataLoading, mutate } = useSWR<TripData>(
        trip?.id ? `/api/trip-data?tripId=${trip.id}` : null,
        fetcher,
        {
            refreshInterval: 5000, // Poll every 5 seconds
            revalidateOnFocus: true,
            ...options
        }
    );

    return {
        trip,
        tripData,
        isLoading: isTripLoading || isDataLoading,
        isError: tripError || dataError,
        mutate,
    };
}
