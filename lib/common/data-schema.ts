import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { SourceFormats } from "./enums.ts";

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

const CoreVectorStoreAdd = z.object({
  /** Plain text or markdown contents of the document */
  content: z.string().min(1),
  metadata: z.object({
    /** Name of the document or URL of the source */
    name: z.string().min(1),
    /** A list of tags to assign to the document */
    tags: z.array(z.string().min(1)),
    /** The format of the originally parsed document */
    sourceFormat: z.string().default(SourceFormats.PLAIN_TEXT),
  }),
});
