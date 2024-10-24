import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

export function parseCoreVectorStoreQuery(body: any) {
  return CoreVectorStoreQuery.safeParse(body);
}

export function parseCoreVectorStoreAdd(body: any) {
  return CoreVectorStoreAdd.safeParse(body);
}

// Schemas

const CoreVectorStoreQuery = z.object({
  query: z.string().min(1),
});
type CoreVectorStoreQuery = z.infer<typeof CoreVectorStoreQuery>;

const CoreVectorStoreAdd = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  labels: z.array(z.string().min(1)),
});
type CoreVectorStoreAdd = z.infer<typeof CoreVectorStoreAdd>;
