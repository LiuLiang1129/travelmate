/// <reference path="../types.d.ts" />

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT * FROM transportations"
        ).all();

        const items = results.map((item: any) => ({
            ...item,
            segments: JSON.parse(item.segments || '[]'),
            reminders: JSON.parse(item.reminders || '[]'),
            checklist: JSON.parse(item.checklist || '[]'),
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
            `INSERT INTO transportations (id, title, segments, checkInTime, reminders, checklist) VALUES (?, ?, ?, ?, ?, ?)`
        )
            .bind(
                item.id,
                item.title,
                JSON.stringify(item.segments),
                item.checkInTime,
                JSON.stringify(item.reminders),
                JSON.stringify(item.checklist)
            )
            .run();

        if (success) {
            return new Response(JSON.stringify(item), { status: 201 });
        } else {
            return new Response("Failed to create transportation", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
