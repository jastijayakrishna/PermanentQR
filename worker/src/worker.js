export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const shortCode = url.pathname.slice(1).toLowerCase().trim();

    // Health check
    if (shortCode === '_health') {
      return new Response('ok', { status: 200 });
    }

    // Reject empty, too long, or invalid codes
    if (!shortCode || shortCode.length > 20 || !/^[a-z0-9_-]+$/.test(shortCode)) {
      return Response.redirect(env.FALLBACK_URL, 302);
    }

    // KV lookup
    const destination = await env.QR_REDIRECTS.get(shortCode);

    if (!destination) {
      return Response.redirect(env.FALLBACK_URL, 302);
    }

    // Redirect
    return Response.redirect(destination, 302);
  }
};
