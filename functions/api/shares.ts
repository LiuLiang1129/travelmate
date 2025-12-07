/// <reference path="../../types.d.ts" />

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const url = new URL(context.request.url);
        const tripId = url.searchParams.get("trip_id");
        const code = url.searchParams.get("code");

        if (tripId) {
            const { results } = await context.env.DB.prepare(
                "SELECT * FROM shares WHERE trip_id = ?"
            )
                .bind(tripId)
                .all();
            return new Response(JSON.stringify(results), { status: 200 });
        } else if (code) {
            const share = await context.env.DB.prepare(
                "SELECT * FROM shares WHERE code = ?"
            )
                .bind(code)
                .first();

            if (!share) {
                return new Response("Share not found", { status: 404 });
            }
            return new Response(JSON.stringify(share), { status: 200 });
        }

        return new Response("Missing trip_id or code", { status: 400 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { tripId, permission, expiresAt } = await context.request.json() as any;

        if (!tripId) {
            return new Response("Missing tripId", { status: 400 });
        }

        const id = crypto.randomUUID();
        const code = crypto.randomUUID(); // Simple unique code
        const createdAt = new Date().toISOString();

        const { success } = await context.env.DB.prepare(
            "INSERT INTO shares (id, trip_id, code, permission, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)"
        )
            .bind(id, tripId, code, permission || "read", createdAt, expiresAt || null)
            .run();

        if (success) {
            return new Response(JSON.stringify({ id, tripId, code, permission, createdAt, expiresAt }), { status: 201 });
        } else {
            return new Response("Failed to create share", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
