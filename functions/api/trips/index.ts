/// <reference path="../../types.d.ts" />

function generateTripCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { name, startDate, endDate } = await context.request.json() as any;

        let code = generateTripCode();
        let isUnique = false;
        let attempts = 0;

        // Simple retry logic to ensure uniqueness
        while (!isUnique && attempts < 5) {
            const existing = await context.env.DB.prepare("SELECT code FROM trips WHERE code = ?").bind(code).first();
            if (!existing) {
                isUnique = true;
            } else {
                code = generateTripCode();
                attempts++;
            }
        }

        if (!isUnique) {
            return new Response(JSON.stringify({ error: "Failed to generate unique code" }), { status: 500 });
        }

        const id = crypto.randomUUID();
        const status = 'active';

        const { success } = await context.env.DB.prepare(
            "INSERT INTO trips (id, code, name, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(id, code, name, startDate, endDate, status).run();

        if (success) {
            return new Response(JSON.stringify({ id, code, name, startDate, endDate, status }), { status: 201 });
        } else {
            return new Response("Failed to create trip", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
