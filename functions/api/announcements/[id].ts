

export const onRequestPut: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const item: any = await context.request.json();

        const { success } = await context.env.DB.prepare(
            `UPDATE announcements SET author=?, text=?, timestamp=?, readBy=?, imageUrl=? WHERE id=?`
        )
            .bind(
                JSON.stringify(item.author),
                item.text,
                item.timestamp,
                JSON.stringify(item.readBy),
                item.imageUrl,
                id
            )
            .run();

        if (success) {
            return new Response(JSON.stringify(item), { status: 200 });
        } else {
            return new Response("Failed to update announcement", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const { success } = await context.env.DB.prepare(
            "DELETE FROM announcements WHERE id = ?"
        )
            .bind(id)
            .run();

        if (success) {
            return new Response("Deleted", { status: 200 });
        } else {
            return new Response("Failed to delete announcement", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
