/// <reference types="@cloudflare/workers-types" />
/// <reference path="../../types.d.ts" />

export const onRequestPut: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const item: any = await context.request.json();
        const safeBind = (val: any) => val === undefined ? null : val;

        const { success } = await context.env.DB.prepare(
            `UPDATE social_posts SET title=?, text=?, mediaUrl=?, mediaType=?, comments=?, likes=?, isPublic=? WHERE id=?`
        )
            .bind(
                safeBind(item.title),
                safeBind(item.text),
                safeBind(item.mediaUrl),
                safeBind(item.mediaType),
                JSON.stringify(item.comments),
                JSON.stringify(item.likes),
                item.isPublic ? 1 : 0,
                id
            )
            .run();

        if (success) {
            return new Response(JSON.stringify(item), { status: 200 });
        } else {
            return new Response("Failed to update post", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    try {
        const id = context.params.id as string;
        const { success } = await context.env.DB.prepare(
            "DELETE FROM social_posts WHERE id = ?"
        )
            .bind(id)
            .run();

        if (success) {
            return new Response("Deleted", { status: 200 });
        } else {
            return new Response("Failed to delete post", { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
