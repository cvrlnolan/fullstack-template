import { describe, expect, it, vi } from "vitest";
import { ApiError, createApi } from "./index";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("operations", () => {
  it("getHealth returns the typed body", async () => {
    const fetchMock = vi.fn(async () => json({ status: "ok", appVersion: "1.2.3" }));
    const api = createApi("http://test", fetchMock as unknown as typeof fetch);
    expect(await api.getHealth()).toEqual({ status: "ok", appVersion: "1.2.3" });
  });

  it("throws ApiError on failure", async () => {
    const api = createApi("http://test", (async () =>
      json({ detail: "boom" }, 500)) as typeof fetch);
    await expect(api.getHealth()).rejects.toBeInstanceOf(ApiError);
  });

  it("streamChat yields text chunks and sends camelCase body", async () => {
    const fetchMock = vi.fn(async (_req: Request) => new Response("hello world"));
    const api = createApi("http://test", fetchMock as unknown as typeof fetch);
    let text = "";
    for await (const chunk of api.streamChat({
      messages: [{ role: "user", content: "hi" }],
      maxTokens: 50,
    }))
      text += chunk;
    expect(text).toBe("hello world");
    const req = fetchMock.mock.calls[0]?.[0] as Request;
    expect(await req.json()).toEqual({
      messages: [{ role: "user", content: "hi" }],
      maxTokens: 50,
    });
  });
});
