/// <reference types="@cloudflare/workers-types" />


export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const item = await context.request.json() as any;
        const id = item.id || crypto.randomUUID();
        const safeBind = (val: any) => val === undefined ? null : val;

        const { success } = await context.env.DB.prepare(
            `INSERT INTO expenses (id, trip_id, description, amount, currency, payerId, participants, date, category, splitMethod, notes, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(
                id,
                item.tripId,
                safeBind(item.description),
                safeBind(item.amount),
                safeBind(item.currency),
                safeBind(item.payerId),
                JSON.stringify(item.participants || []),
                safeBind(item.date),
                safeBind(item.category),
                safeBind(item.splitMethod),
                safeBind(item.notes),
                safeBind(item.authorId)
            )
            .run();

        if (success) {
            return new Response(JSON.stringify({ ...item, id }), { status: 201 });
        } else {
            return new Response("Failed to create expense", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
