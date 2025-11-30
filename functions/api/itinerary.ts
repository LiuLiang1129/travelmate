/// <reference path="../types.d.ts" />

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT * FROM itinerary_items"
        ).all();

        // Parse JSON fields
        const items = results.map((item: any) => ({
            ...item,
            comments: JSON.parse(item.comments || '[]'),
            vote: item.vote ? JSON.parse(item.vote) : null,
            // Ensure boolean/number types are correct if SQLite returns strings
            day: Number(item.day),
            endDay: item.endDay ? Number(item.endDay) : undefined,
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
            `INSERT INTO itinerary_items (id, day, endDay, type, title, time, duration, description, location, imageUrl, comments, vote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(
                item.id,
                item.day,
                item.endDay,
                item.type,
                item.title,
                item.time,
                item.duration,
                item.description,
                item.location,
                item.imageUrl,
                JSON.stringify(item.comments),
                item.vote ? JSON.stringify(item.vote) : null
            )
            .run();

        if (success) {
            return new Response(JSON.stringify(item), { status: 201 });
        } else {
            return new Response("Failed to create item", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
