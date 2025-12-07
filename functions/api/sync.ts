/// <reference types="@cloudflare/workers-types" />
/// <reference path="../types.d.ts" />

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { tripId, itinerary, announcements, transportations, socialPosts, expenses, discussionThreads } = await context.request.json() as any;

        if (!tripId) {
            return new Response("Missing tripId", { status: 400 });
        }

        // We will perform a series of operations. D1 doesn't support big transactions in the same way as traditional SQL via HTTP API easily without batching, 
        // but we can run them sequentially. For a robust app, use batch().

        const db = context.env.DB;

        // Helper to handle undefined -> null
        const safeBind = (val: any) => val === undefined ? null : val;

        // 1. Itinerary Items
        if (itinerary) {
            await db.prepare("DELETE FROM itinerary_items WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO itinerary_items (id, trip_id, day, endDay, type, title, time, duration, description, location, imageUrl, comments, vote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            const batch = itinerary.map((item: any) => stmt.bind(
                safeBind(item.id), tripId, safeBind(item.day), safeBind(item.endDay), safeBind(item.type), safeBind(item.title), safeBind(item.time), safeBind(item.duration), safeBind(item.description), safeBind(item.location), safeBind(item.imageUrl),
                JSON.stringify(item.comments || []), item.vote ? JSON.stringify(item.vote) : null
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        // 2. Announcements
        if (announcements) {
            await db.prepare("DELETE FROM announcements WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO announcements (id, trip_id, author, text, timestamp, readBy, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            const batch = announcements.map((item: any) => stmt.bind(
                safeBind(item.id), tripId, JSON.stringify(item.author), safeBind(item.text), safeBind(item.timestamp), JSON.stringify(item.readBy || []), safeBind(item.imageUrl)
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        // 3. Transportations
        if (transportations) {
            await db.prepare("DELETE FROM transportations WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO transportations (id, trip_id, title, segments, checkInTime, reminders, checklist) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            const batch = transportations.map((item: any) => stmt.bind(
                safeBind(item.id), tripId, safeBind(item.title), JSON.stringify(item.segments || []), safeBind(item.checkInTime), JSON.stringify(item.reminders || []), JSON.stringify(item.checklist || [])
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        // 4. Social Posts
        if (socialPosts) {
            await db.prepare("DELETE FROM social_posts WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO social_posts (id, trip_id, author, timestamp, title, text, mediaUrl, mediaType, comments, likes, isPublic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            const batch = socialPosts.map((item: any) => stmt.bind(
                safeBind(item.id),
                tripId,
                JSON.stringify(item.author),
                safeBind(item.timestamp),
                safeBind(item.title),
                safeBind(item.text),
                safeBind(item.mediaUrl),
                safeBind(item.mediaType),
                JSON.stringify(item.comments || []),
                JSON.stringify(item.likes || []),
                item.isPublic ? 1 : 0
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        // 5. Expenses
        if (expenses) {
            await db.prepare("DELETE FROM expenses WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO expenses (id, trip_id, description, amount, currency, payerId, participants, date, category, splitMethod, notes, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            const batch = expenses.map((item: any) => stmt.bind(
                safeBind(item.id), tripId, safeBind(item.description), safeBind(item.amount), safeBind(item.currency), safeBind(item.payerId), JSON.stringify(item.participants || []), safeBind(item.date), safeBind(item.category), safeBind(item.splitMethod), safeBind(item.notes), safeBind(item.authorId)
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        // 6. Discussion Threads
        if (discussionThreads) {
            await db.prepare("DELETE FROM discussion_threads WHERE trip_id = ?").bind(tripId).run();
            const stmt = db.prepare(`INSERT INTO discussion_threads (id, trip_id, title, topic, content, imageUrl, author, timestamp, replies, lastActivity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            const batch = discussionThreads.map((item: any) => stmt.bind(
                safeBind(item.id), tripId, safeBind(item.title), safeBind(item.topic), safeBind(item.content), safeBind(item.imageUrl), JSON.stringify(item.author), safeBind(item.timestamp), JSON.stringify(item.replies || []), safeBind(item.lastActivity)
            ));
            if (batch.length > 0) await db.batch(batch);
        }

        return new Response("Synced successfully", { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
