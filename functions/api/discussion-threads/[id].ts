/// <reference types="@cloudflare/workers-types" />
/// <reference path="../../types.d.ts" />

export const onRequestPut: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const item: any = await context.request.json();
        const safeBind = (val: any) => val === undefined ? null : val;

        const { success } = await context.env.DB.prepare(
            `UPDATE discussion_threads SET replies=?, lastActivity=? WHERE id=?`
        )
            .bind(
                JSON.stringify(item.replies),
                safeBind(item.lastActivity),
                id
            )
            .run();

        if (success) {
            return new Response(JSON.stringify(item), { status: 200 });
        } else {
            return new Response("Failed to update thread", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const { success } = await context.env.DB.prepare(
            "DELETE FROM discussion_threads WHERE id = ?"
        )
            .bind(id)
            .run();

        if (success) {
            return new Response("Deleted", { status: 200 });
        } else {
            return new Response("Failed to delete thread", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
