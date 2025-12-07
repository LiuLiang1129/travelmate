/// <reference types="@cloudflare/workers-types" />
/// <reference path="../../types.d.ts" />

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const url = new URL(context.request.url);
        const tripId = url.searchParams.get("trip_id");

        if (tripId) {
            const { results } = await context.env.DB.prepare(
                "SELECT * FROM social_posts WHERE trip_id = ?"
            )
                .bind(tripId)
                .all();

            // Parse JSON fields
            const posts = results.map(post => ({
                ...post,
                author: JSON.parse(post.author as string),
                comments: JSON.parse(post.comments as string),
                likes: JSON.parse(post.likes as string),
                isPublic: Boolean(post.isPublic)
            }));

            return new Response(JSON.stringify(posts), { status: 200 });
        }

        return new Response("Missing trip_id", { status: 400 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const item = await context.request.json() as any;
        const id = item.id || crypto.randomUUID();

        // Helper to handle undefined -> null
        const safeBind = (val: any) => val === undefined ? null : val;

        const { success } = await context.env.DB.prepare(
            `INSERT INTO social_posts (id, trip_id, author, timestamp, title, text, mediaUrl, mediaType, comments, likes, isPublic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(
                id,
                item.tripId,
                JSON.stringify(item.author),
                safeBind(item.timestamp),
                safeBind(item.title),
                safeBind(item.text),
                safeBind(item.mediaUrl),
                safeBind(item.mediaType),
                JSON.stringify(item.comments || []),
                JSON.stringify(item.likes || []),
                item.isPublic ? 1 : 0
            )
            .run();

        if (success) {
            return new Response(JSON.stringify({ ...item, id }), { status: 201 });
        } else {
            return new Response("Failed to create post", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
