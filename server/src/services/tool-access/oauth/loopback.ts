export function isOAuthLoopbackHostname(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "localhost" || host.endsWith(".localhost") || host === "::1" || /^127(?:\.\d{1,3}){3}$/.test(host);
}

export function oauthClientApplicationType(redirectUri: string): "native" | "web" {
  const url = new URL(redirectUri);
  return url.protocol === "http:" && isOAuthLoopbackHostname(url.hostname) ? "native" : "web";
}
