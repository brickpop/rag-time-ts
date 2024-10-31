import type { VECTOR_STORE_ENGINES } from "./constants.ts";
import { SourceFormats } from "./enums.ts";

export type Doc = {
  /** The plan text or Markdown contents */
  content: string;
  metadata: {
    /** The name or URL of the original document */
    name: string;
    /** Arbitrary tags used for filtering later on */
    tags: Array<string>;
    sourceFormat: SourceFormats;
    [k: string]: string | Array<string>;
  };
};

// Generic

type JsonLiteral = boolean | number | string;
export type JsonValue =
  | { [k: string]: JsonLiteral }
  | Array<JsonLiteral>
  | JsonLiteral;

export type VectorStoreEngine = (typeof VECTOR_STORE_ENGINES)[number];
