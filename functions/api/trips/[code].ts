

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const code = context.params.code as string;

        const trip = await context.env.DB.prepare(
            "SELECT * FROM trips WHERE code = ?"
        ).bind(code).first();

        if (trip) {
            return new Response(JSON.stringify(trip), {
                headers: { "Content-Type": "application/json" },
            });
        } else {
            return new Response("Trip not found", { status: 404 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
