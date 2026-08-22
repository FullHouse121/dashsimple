// The request helper the views now share. What is worth pinning here is the
// error path: which message a person ends up seeing, and where it came from.
import { describe, it, expect, vi, beforeEach } from "vitest";

const apiFetch = vi.fn();
vi.mock("../src/lib/api.js", () => ({ apiFetch: (...args) => apiFetch(...args) }));

const { apiJson, apiSend } = await import("../src/lib/useResource.js");

const reply = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    if (body === undefined) throw new SyntaxError("Unexpected token <");
    return body;
  },
});

beforeEach(() => apiFetch.mockReset());

describe("apiJson", () => {
  it("returns the parsed body on success", async () => {
    apiFetch.mockResolvedValue(reply(200, [{ id: 1 }]));
    expect(await apiJson("/api/pixels")).toEqual([{ id: 1 }]);
  });

  it("prefers the server's own message over the fallback", async () => {
    apiFetch.mockResolvedValue(reply(400, { error: "Domain already bound." }));
    await expect(apiJson("/api/domains", {}, "Failed to save.")).rejects.toThrow("Domain already bound.");
  });

  it("falls back when the failure has no readable body", async () => {
    // A proxy or a crashed process answers with HTML, not JSON.
    apiFetch.mockResolvedValue(reply(502, undefined));
    await expect(apiJson("/api/pixels", {}, "Failed to load pixels.")).rejects.toThrow("Failed to load pixels.");
  });

  it("carries the status so a caller can tell 404 from 500", async () => {
    apiFetch.mockResolvedValue(reply(404, { error: "No such link." }));
    await expect(apiJson("/api/tracking-links/9")).rejects.toMatchObject({ status: 404 });
  });

  it("does not treat an unparseable body as failure when the status is ok", async () => {
    // 204 No Content: nothing to parse, and nothing wrong.
    apiFetch.mockResolvedValue(reply(204, undefined));
    expect(await apiJson("/api/tracking-links/9", { method: "DELETE" })).toBeNull();
  });
});

describe("apiSend", () => {
  it("sends JSON with the method and header every mutation was writing by hand", async () => {
    apiFetch.mockResolvedValue(reply(200, { ok: true }));
    await apiSend("/api/pixels/3", "PATCH", { status: "paused" }, "Failed to update.");
    const [url, options] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/pixels/3");
    expect(options.method).toBe("PATCH");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({ status: "paused" });
  });
});
