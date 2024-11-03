import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { SourceFormats } from "./enums.ts";

export function parseStoreQuery(body: any) {
  return StoreQuery.safeParse(body);
}

export function parseStoreAdd(body: any) {
  return StoreAdd.safeParse(body);
}

// Types

export type StoreAdd = z.infer<typeof StoreAdd>;
export type StoreQuery = z.infer<typeof StoreQuery>;

// Schemas

const StoreQuery = z.object({
  query: z.string().min(1),
});

const StoreAdd = z.object({
  /** Plain text or markdown contents of the document */
  content: z.string().min(1),
  metadata: z
    .object({
      /** Name of the document or URL of the source */
      name: z.string(),
      /** A list of tags to assign to the document */
      tags: z.array(z.string()),
      /** The format of the originally parsed document */
      sourceFormat: z.string().default(SourceFormats.PLAIN_TEXT),
    })
    .catchall(z.string()),
});
