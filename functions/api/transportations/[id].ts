/// <reference path="../../types.d.ts" />

export const onRequestPut: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const item: any = await context.request.json();

        const { success } = await context.env.DB.prepare(
            `UPDATE transportations SET title=?, segments=?, checkInTime=?, reminders=?, checklist=? WHERE id=?`
        )
            .bind(
                item.title,
                JSON.stringify(item.segments),
                item.checkInTime,
                JSON.stringify(item.reminders),
                JSON.stringify(item.checklist),
                id
            )
            .run();

        if (success) {
            return new Response(JSON.stringify(item), { status: 200 });
        } else {
            return new Response("Failed to update transportation", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const { success } = await context.env.DB.prepare(
            "DELETE FROM transportations WHERE id = ?"
        )
            .bind(id)
            .run();

        if (success) {
            return new Response("Deleted", { status: 200 });
        } else {
            return new Response("Failed to delete transportation", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
