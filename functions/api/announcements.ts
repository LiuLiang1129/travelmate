/// <reference path="../types.d.ts" />

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT * FROM announcements ORDER BY timestamp DESC"
        ).all();

        const items = results.map((item: any) => ({
            ...item,
            author: JSON.parse(item.author),
            readBy: JSON.parse(item.readBy || '[]'),
        }));

        return new Response(JSON.stringify(items), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const item: any = await context.request.json();

        const { success } = await context.env.DB.prepare(
            `INSERT INTO announcements (id, author, text, timestamp, readBy, imageUrl) VALUES (?, ?, ?, ?, ?, ?)`
        )
            .bind(
                item.id,
                JSON.stringify(item.author),
                item.text,
                item.timestamp,
                JSON.stringify(item.readBy),
                item.imageUrl
            )
            .run();

        if (success) {
            return new Response(JSON.stringify(item), { status: 201 });
        } else {
            return new Response("Failed to create announcement", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
