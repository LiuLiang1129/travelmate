/// <reference path="../../types.d.ts" />

export const onRequestPut: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const item: any = await context.request.json();

        const { success } = await context.env.DB.prepare(
            `UPDATE itinerary_items SET day=?, endDay=?, type=?, title=?, time=?, duration=?, description=?, location=?, imageUrl=?, comments=?, vote=? WHERE id=?`
        )
            .bind(
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
                item.vote ? JSON.stringify(item.vote) : null,
                id
            )
            .run();

        if (success) {
            return new Response(JSON.stringify(item), { status: 200 });
        } else {
            return new Response("Failed to update item", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const { success } = await context.env.DB.prepare(
            "DELETE FROM itinerary_items WHERE id = ?"
        )
            .bind(id)
            .run();

        if (success) {
            return new Response("Deleted", { status: 200 });
        } else {
            return new Response("Failed to delete item", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
