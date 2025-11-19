export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/flashcards") {
      return new Response("Not found", { status: 404 });
    }

    // Read flashcards.json from R2
    const object = await env.FLASHCARDS_BUCKET.get("flashcards.json");
    if (!object) {
      return new Response("flashcards.json not found", { status: 404 });
    }

    const jsonText = await object.text();

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    };

    return new Response(jsonText, { status: 200, headers });
  },
};
