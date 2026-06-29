/**
 * Ticket links coming from Ticketmaster's API are often wrapped in an affiliate
 * redirector (e.g. https://ticketmaster.evyy.net/c/<pub>/<id>?u=<real-url>).
 * When the affiliate account isn't active, that redirector returns
 * "The link you clicked on is malformed" instead of forwarding to the ticket
 * page. The real destination is always present in the `u` query parameter, so
 * we unwrap it to guarantee the ticket link actually opens.
 *
 * If/when a valid affiliate setup is in place, this can be relaxed to pass the
 * wrapper through.
 */
const AFFILIATE_HOSTS = /(\.evyy\.net|\.prf\.hn|\.pxf\.io|\.sjv\.io|\.go2cloud\.org)$/i;

export function resolveTicketUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (AFFILIATE_HOSTS.test(parsed.hostname)) {
      const dest = parsed.searchParams.get("u");
      if (dest) {
        const decoded = decodeURIComponent(dest);
        if (/^https?:\/\//i.test(decoded)) return decoded;
      }
    }
    return url;
  } catch {
    return url;
  }
}
