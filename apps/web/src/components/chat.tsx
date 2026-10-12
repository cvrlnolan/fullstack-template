"use client";

import type { Schemas } from "@app/api-client";
import { Button } from "@app/ui/components/button";
import { Input } from "@app/ui/components/input";
import { useState } from "react";
import { api } from "@/lib/api";

type Message = Schemas["ChatMessage"];

export function Chat({ streamChat = api.streamChat }: { streamChat?: typeof api.streamChat }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const history: Message[] = [...messages, { role: "user", content: input }];
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
          <li key={i} className={m.role === "user" ? "text-right" : ""}>
            <span className="inline-block whitespace-pre-wrap rounded-lg bg-muted px-3 py-2">
              {m.content}
            </span>
          </li>
        ))}
      </ul>
      <form onSubmit={send} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something…"
        />
        <Button type="submit" disabled={busy}>
          Send
        </Button>
      </form>
    </div>
  );
}
