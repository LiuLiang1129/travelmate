/// <reference types="@cloudflare/workers-types" />
/// <reference path="../../types.d.ts" />

export const onRequestPut: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const item: any = await context.request.json();
        const safeBind = (val: any) => val === undefined ? null : val;

        const { success } = await context.env.DB.prepare(
            `UPDATE expenses SET description=?, amount=?, currency=?, payerId=?, participants=?, date=?, category=?, splitMethod=?, notes=? WHERE id=?`
        )
            .bind(
                safeBind(item.description),
                safeBind(item.amount),
                safeBind(item.currency),
                safeBind(item.payerId),
                JSON.stringify(item.participants),
                safeBind(item.date),
                safeBind(item.category),
                safeBind(item.splitMethod),
                safeBind(item.notes),
                id
            )
            .run();

        if (success) {
            return new Response(JSON.stringify(item), { status: 200 });
        } else {
            return new Response("Failed to update expense", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const { success } = await context.env.DB.prepare(
            "DELETE FROM expenses WHERE id = ?"
        )
            .bind(id)
            .run();

        if (success) {
            return new Response("Deleted", { status: 200 });
        } else {
            return new Response("Failed to delete expense", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
