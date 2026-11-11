import { describe, expect, it, vi } from "vitest";
import { createOAuthClientProtocol } from "../services/tool-access/oauth/client.js";
import { oauthClientIdMetadataDocument } from "../services/tool-access/oauth/client-metadata.js";

describe("OAuth client type", () => {
  it.each([
    ["http://localhost:3100/callback", "native"],
    ["http://127.0.0.1:3100/callback", "native"],
    ["http://127.0.0.2:3100/callback", "native"],
    ["http://[::1]:3100/callback", "native"],
    ["http://example.localhost:3100/callback", "native"],
    ["https://paperclip.example/callback", "web"],
    ["https://localhost:3100/callback", "web"],
    ["http://192.168.1.3:3100/callback", "web"],
  ])("registers and describes %s as %s", async (redirectUri, expected) => {
    const fetchRemoteHttpUrl = vi.fn(async (_url: string, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      expect(request.application_type).toBe(expected);
      return Response.json({ client_id: "fixture", redirect_uris: [redirectUri] });
    });
    const { requestOAuthClientRegistration } = createOAuthClientProtocol({
      fetchRemoteHttpUrl,
      assertOAuthEndpointUrl: (_kind, value) => String(value),
    });
    await requestOAuthClientRegistration({
      endpoints: { provider: "fixture", scopes: [], authorizationUrl: "https://example.com/authorize", tokenUrl: "https://example.com/token", registrationUrl: "https://example.com/register" },
      redirectUri,
    });
    expect(fetchRemoteHttpUrl).toHaveBeenCalledOnce();
    expect(oauthClientIdMetadataDocument({ clientId: "https://paperclip.example/client", redirectUri }).application_type).toBe(expected);
  });
});
