import createClient from "openapi-fetch";
import type { paths } from "./schema";

/** Low-level typed client: `client.GET("/health")`, `client.POST("/chat", { body })`. Paths, params and bodies are checked against the OpenAPI schema. */
export function createApiClient(baseUrl: string, fetchImpl?: typeof fetch) {
  return createClient<paths>({ baseUrl, fetch: fetchImpl });
}

export type ApiClient = ReturnType<typeof createApiClient>;
