/// <reference path="../../types.d.ts" />

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const url = new URL(context.request.url);
        const tripId = url.searchParams.get("tripId");

        if (!tripId) {
            return new Response("Missing tripId", { status: 400 });
        }

        const db = context.env.DB;

        const itinerary = await db.prepare("SELECT * FROM itinerary_items WHERE trip_id = ?").bind(tripId).all();
        const announcements = await db.prepare("SELECT * FROM announcements WHERE trip_id = ?").bind(tripId).all();
        const transportations = await db.prepare("SELECT * FROM transportations WHERE trip_id = ?").bind(tripId).all();
        const socialPosts = await db.prepare("SELECT * FROM social_posts WHERE trip_id = ?").bind(tripId).all();
        const expenses = await db.prepare("SELECT * FROM expenses WHERE trip_id = ?").bind(tripId).all();
        const discussionThreads = await db.prepare("SELECT * FROM discussion_threads WHERE trip_id = ?").bind(tripId).all();

        // Helper to parse JSON fields
        const parseJSON = (items: any[], fields: string[]) => {
            return items.map(item => {
                const newItem = { ...item };
                fields.forEach(field => {
                    if (newItem[field]) {
                        try {
                            newItem[field] = JSON.parse(newItem[field]);
                        } catch (e) {
                            console.error(`Failed to parse ${field} for item ${item.id}`, e);
                            newItem[field] = null; // or [] depending on type
                        }
                    }
                });
                return newItem;
            });
        };

        const responseData = {
            itinerary: parseJSON(itinerary.results, ['comments', 'vote']),
            announcements: parseJSON(announcements.results, ['author', 'readBy']),
            transportations: parseJSON(transportations.results, ['segments', 'reminders', 'checklist']),
            socialPosts: parseJSON(socialPosts.results, ['author', 'comments', 'likes']),
            expenses: parseJSON(expenses.results, ['participants']),
            discussionThreads: parseJSON(discussionThreads.results, ['author', 'replies'])
        };

        // Specific fix for itinerary types
        responseData.itinerary = responseData.itinerary.map((item: any) => ({
            ...item,
            day: Number(item.day),
            endDay: item.endDay ? Number(item.endDay) : undefined,
        }));


        return new Response(JSON.stringify(responseData), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
