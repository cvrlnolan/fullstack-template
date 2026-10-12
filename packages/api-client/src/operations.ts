import type { ApiClient } from "./client";
import type { components, operations } from "./schema";

export type Schemas = components["schemas"];

/** Request body type of an operation, by operationId. */
export type OperationBody<K extends keyof operations> = operations[K] extends {
  requestBody: { content: { "application/json": infer B } };
}
  ? B
  : never;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

/**
 * One typed function per backend operationId. Add new endpoints here after running `pnpm api:schema`;
 * the compiler tells you when the backend contract changes under you.
 */
export function createOperations(client: ApiClient) {
  return {
    async getHealth(signal?: AbortSignal): Promise<Schemas["HealthResponse"]> {
      const { data, error, response } = await client.GET("/health", { signal });
      if (data === undefined) throw new ApiError(response.status, error);
      return data;
    },

    /** Streams the assistant reply as text chunks. */
    async *streamChat(
      body: OperationBody<"streamChat">,
      signal?: AbortSignal,
    ): AsyncGenerator<string> {
      const { data, error, response } = await client.POST("/chat", {
        body,
        parseAs: "stream",
        signal,
      });
      if (!response.ok || !data) throw new ApiError(response.status, error);
      const reader = data.pipeThrough(new TextDecoderStream()).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        yield value;
      }
    },
  };
}

export type ApiOperations = ReturnType<typeof createOperations>;
