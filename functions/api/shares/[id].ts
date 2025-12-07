

export const onRequestPut: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const { permission, expiresAt } = await context.request.json() as any;

        const { success } = await context.env.DB.prepare(
            "UPDATE shares SET permission = ?, expires_at = ? WHERE id = ?"
        )
            .bind(permission, expiresAt, id)
            .run();

        if (success) {
            return new Response("Updated", { status: 200 });
        } else {
            return new Response("Failed to update share", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;

        const { success } = await context.env.DB.prepare(
            "DELETE FROM shares WHERE id = ?"
        )
            .bind(id)
            .run();

        if (success) {
            return new Response("Deleted", { status: 200 });
        } else {
            return new Response("Failed to delete share", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
