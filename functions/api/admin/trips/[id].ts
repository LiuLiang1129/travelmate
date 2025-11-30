/// <reference path="../../types.d.ts" />

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;

        if (!id) {
            return new Response("Missing trip id", { status: 400 });
        }

        const db = context.env.DB;

        // Delete from all tables
        await db.batch([
            db.prepare("DELETE FROM itinerary_items WHERE trip_id = ?").bind(id),
            db.prepare("DELETE FROM announcements WHERE trip_id = ?").bind(id),
            db.prepare("DELETE FROM transportations WHERE trip_id = ?").bind(id),
            db.prepare("DELETE FROM social_posts WHERE trip_id = ?").bind(id),
            db.prepare("DELETE FROM expenses WHERE trip_id = ?").bind(id),
            db.prepare("DELETE FROM discussion_threads WHERE trip_id = ?").bind(id),
            db.prepare("DELETE FROM trips WHERE id = ?").bind(id)
        ]);

        return new Response("Deleted successfully", { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
