import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => {
    if (!r.ok) throw new Error('Failed to fetch');
    return r.json();
});

export function useShares(tripId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        tripId ? `/api/shares?trip_id=${tripId}` : null,
        fetcher
    );

    return {
        shares: data,
        isLoading,
        isError: error,
        mutate
    };
}
