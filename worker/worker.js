export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1); // Remove the leading slash

    // If the URL is just root "/", say hello
    if (!key) {
      return new Response("Worker is running! Try adding a filename to the URL, like /my-image.png");
    }

    // Try to get the file from your R2 bucket
    const object = await env.FLASHCARDS_BUCKET.get(key);

    if (object === null) {
      return new Response("Object Not Found in R2 Bucket", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  },
};