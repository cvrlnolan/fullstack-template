/** Types shared between TS apps. Keep in sync with the API's schemas (or generate them from its OpenAPI spec). */
export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}
