import type { ChatRequest } from "@app/shared";

/** Streams text chunks from the API's /chat endpoint (proxied through Next at /api/chat). */
export async function* streamChat(body: ChatRequest, signal?: AbortSignal): AsyncGenerator<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Chat request failed: ${res.status}`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) return;
    yield value;
  }
}
