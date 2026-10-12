"use client";

import type { ChatMessage } from "@app/shared";
import { useState } from "react";
import { streamChat } from "@/lib/api";

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const history: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      for await (const chunk of streamChat({ messages: history })) {
        setMessages((prev) => {
          const last = prev.at(-1);
          if (!last) return prev;
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {messages.map((m, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
          <li key={i} className={m.role === "user" ? "text-right" : ""}>
            <span className="inline-block whitespace-pre-wrap rounded-lg bg-neutral-100 px-3 py-2">
              {m.content}
            </span>
          </li>
        ))}
      </ul>
      <form onSubmit={send} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something…"
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
