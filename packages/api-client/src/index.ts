import { createApiClient } from "./client";
import { createOperations } from "./operations";

export * from "./client";
export * from "./operations";
export type { components, operations, paths } from "./schema";

/** Convenience: client + operations in one call. */
export function createApi(baseUrl: string, fetchImpl?: typeof fetch) {
  const client = createApiClient(baseUrl, fetchImpl);
  return { client, ...createOperations(client) };
}
