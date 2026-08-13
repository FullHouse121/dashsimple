/**
 * Cloudflare Email Worker — forwards verification codes into the dashboard.
 *
 * Deploy on the domain set as MAIL_FORWARD_DOMAIN. Cloudflare Email Routing
 * catches everything sent to that domain and hands each message here; this
 * posts it to /api/mailbox/inbound, which extracts the code and stores it
 * against whichever account owns that forward address.
 *
 * Bindings required (Workers → Settings → Variables):
 *   DASHBOARD_URL    https://<your-render-host>       (no trailing slash)
 *   INBOUND_SECRET   must equal INBOUND_MAIL_SECRET on the server
 *
 * Setup: Cloudflare → Email → Email Routing → Routes → "Catch-all" → send to
 * this Worker. Nothing else needs to be configured per address; the dashboard
 * mints addresses on the same domain and matches them on arrival.
 */
export default {
  async email(message, env, ctx) {
    // The whole RFC822 message. The server parses it rather than trusting
    // headers we pick out here, so forward it intact.
    const raw = await new Response(message.raw).text();

    // message.from is the envelope sender. Auto-forwarded mail often rewrites
    // it to the forwarding mailbox, so also pass the original From header —
    // the server's sender allowlist checks whichever it is given.
    const headerFrom = message.headers.get("from") || "";

    const payload = {
      to: String(message.to || "").toLowerCase(),
      from: headerFrom || message.from || "",
      subject: message.headers.get("subject") || "",
      raw,
    };

    try {
      const response = await fetch(`${env.DASHBOARD_URL}/api/mailbox/inbound`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-inbound-secret": env.INBOUND_SECRET,
        },
        body: JSON.stringify(payload),
      });

      // Logged, not thrown: a rejected message must not bounce back to the
      // sender, and the response says why it was ignored (wrong sender, no
      // matching account) which is what you need when a code does not appear.
      const body = await response.text();
      console.log(`inbound ${message.to} -> ${response.status} ${body}`);
    } catch (error) {
      console.error(`inbound ${message.to} failed:`, error.message);
    }
  },
};
