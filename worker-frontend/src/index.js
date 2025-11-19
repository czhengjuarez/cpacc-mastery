export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API endpoint - serve flashcards from R2
    if (url.pathname === "/api/flashcards") {
      const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      // Handle OPTIONS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
      }

      // GET - return all flashcards
      if (request.method === "GET") {
        const object = await env.FLASHCARDS_BUCKET.get("flashcards.json");
        if (!object) {
          return new Response("flashcards.json not found", { status: 404 });
        }

        const jsonText = await object.text();
        return new Response(jsonText, { status: 200, headers });
      }

      // POST - add a new flashcard
      if (request.method === "POST") {
        try {
          // Get existing cards
          const object = await env.FLASHCARDS_BUCKET.get("flashcards.json");
          let cards = [];
          if (object) {
            const jsonText = await object.text();
            cards = JSON.parse(jsonText);
          }

          // Parse new card data
          const newCard = await request.json();
          if (!newCard.term || !newCard.definition) {
            return new Response(
              JSON.stringify({ error: "term and definition are required" }),
              { status: 400, headers }
            );
          }

          // Generate new card_id (max existing id + 1)
          const maxId = cards.length > 0 
            ? Math.max(...cards.map(c => c.card_id)) 
            : 0;
          const card_id = maxId + 1;

          // Add new card
          const cardToAdd = {
            card_id,
            term: newCard.term,
            definition: newCard.definition
          };
          cards.push(cardToAdd);

          // Save back to R2
          await env.FLASHCARDS_BUCKET.put(
            "flashcards.json",
            JSON.stringify(cards, null, 2)
          );

          return new Response(
            JSON.stringify({ success: true, card_id }),
            { status: 201, headers }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers }
          );
        }
      }

      return new Response("Method not allowed", { status: 405, headers });
    }

    // For all other paths, serve static assets
    // The assets binding automatically serves files from the directory
    return env.ASSETS.fetch(request);
  },
};
