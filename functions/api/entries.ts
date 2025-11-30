interface Entry {
    id: number;
    content: string;
    created_at: number;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    const { results } = await env.DB.prepare(
        "SELECT * FROM entries ORDER BY created_at DESC"
    ).all<Entry>();
    return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    const { content } = await request.json() as { content: string };
    if (!content) {
        return new Response("Content is required", { status: 400 });
    }
    const { success } = await env.DB.prepare(
        "INSERT INTO entries (content) VALUES (?)"
    )
        .bind(content)
        .run();

    if (success) {
        return new Response("Created", { status: 201 });
    } else {
        return new Response("Failed to create entry", { status: 500 });
    }
};
