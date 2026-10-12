import { createApi } from "@app/api-client";

/** Browser-side API. Requests go to /api/* and are proxied to FastAPI by next.config.ts. */
export const api = createApi("/api");
