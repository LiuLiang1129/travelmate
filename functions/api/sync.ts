/// <reference path="../../types.d.ts" />

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { tripId, itinerary, announcements, transportations, socialPosts, expenses, discussionThreads } = await context.request.json() as any;

        if (!tripId) {
            return new Response("Missing tripId", { status: 400 });
        }

        // We will perform a series of operations. D1 doesn't support big transactions in the same way as traditional SQL via HTTP API easily without batching, 
        // but we can run them sequentially. For a robust app, use batch().

        const db = context.env.DB;

        // 1. Itinerary Items
        if (itinerary) {
            await db.prepare("DELETE FROM itinerary_items WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO itinerary_items (id, trip_id, day, endDay, type, title, time, duration, description, location, imageUrl, comments, vote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            const batch = itinerary.map((item: any) => stmt.bind(
                item.id, tripId, item.day, item.endDay, item.type, item.title, item.time, item.duration, item.description, item.location, item.imageUrl,
                JSON.stringify(item.comments), item.vote ? JSON.stringify(item.vote) : null
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        // 2. Announcements
        if (announcements) {
            await db.prepare("DELETE FROM announcements WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO announcements (id, trip_id, author, text, timestamp, readBy, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            const batch = announcements.map((item: any) => stmt.bind(
                item.id, tripId, JSON.stringify(item.author), item.text, item.timestamp, JSON.stringify(item.readBy), item.imageUrl
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        // 3. Transportations
        if (transportations) {
            await db.prepare("DELETE FROM transportations WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO transportations (id, trip_id, title, segments, checkInTime, reminders, checklist) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            const batch = transportations.map((item: any) => stmt.bind(
                item.id, tripId, item.title, JSON.stringify(item.segments), item.checkInTime, JSON.stringify(item.reminders), JSON.stringify(item.checklist)
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        // 4. Social Posts
        if (socialPosts) {
            await db.prepare("DELETE FROM social_posts WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO social_posts (id, trip_id, author, timestamp, title, text, mediaUrl, mediaType, comments, likes, isPublic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            const batch = socialPosts.map((item: any) => stmt.bind(
                item.id, tripId, JSON.stringify(item.author), item.timestamp, item.title, item.text, item.mediaUrl, item.mediaType, JSON.stringify(item.comments), JSON.stringify(item.likes), item.isPublic
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        // 5. Expenses
        if (expenses) {
            await db.prepare("DELETE FROM expenses WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO expenses (id, trip_id, description, amount, currency, payerId, participants, date, category, splitMethod, notes, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            const batch = expenses.map((item: any) => stmt.bind(
                item.id, tripId, item.description, item.amount, item.currency, item.payerId, JSON.stringify(item.participants), item.date, item.category, item.splitMethod, item.notes, item.authorId
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        // 6. Discussion Threads
        if (discussionThreads) {
            await db.prepare("DELETE FROM discussion_threads WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO discussion_threads (id, trip_id, title, topic, content, imageUrl, author, timestamp, replies, lastActivity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            const batch = discussionThreads.map((item: any) => stmt.bind(
                item.id, tripId, item.title, item.topic, item.content, item.imageUrl, JSON.stringify(item.author), item.timestamp, JSON.stringify(item.replies), item.lastActivity
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        return new Response("Synced successfully", { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
