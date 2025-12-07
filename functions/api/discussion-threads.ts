/// <reference types="@cloudflare/workers-types" />


export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const item = await context.request.json() as any;
        const id = item.id || crypto.randomUUID();
        const safeBind = (val: any) => val === undefined ? null : val;

        const { success } = await context.env.DB.prepare(
            `INSERT INTO discussion_threads (id, trip_id, title, topic, content, imageUrl, author, timestamp, replies, lastActivity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(
                id,
                item.tripId,
                safeBind(item.title),
                safeBind(item.topic),
                safeBind(item.content),
                safeBind(item.imageUrl),
                JSON.stringify(item.author),
                safeBind(item.timestamp),
                JSON.stringify(item.replies || []),
                safeBind(item.lastActivity)
            )
            .run();

        if (success) {
            return new Response(JSON.stringify({ ...item, id }), { status: 201 });
        } else {
            return new Response("Failed to create thread", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
