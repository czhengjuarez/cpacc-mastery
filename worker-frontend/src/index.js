export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API endpoint - serve flashcards from R2
    if (url.pathname === "/api/flashcards") {
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
    }

    // For all other paths, serve static assets
    // The assets binding automatically serves files from the directory
    return env.ASSETS.fetch(request);
  },
};
