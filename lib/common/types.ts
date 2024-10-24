import type { VECTOR_STORE_ENGINES } from "./constants.ts";
import { ParserId } from "./enums.ts";

export type Doc = {
  content: string;
  metadata: {
    tags: Array<string>;
    parser: ParserId;
    [k: string]: string | Array<string>;
  };
  origin: string;
};

// Generic

type JsonLiteral = boolean | number | string;
export type JsonValue =
  | { [k: string]: JsonLiteral }
  | Array<JsonLiteral>
  | JsonLiteral;

export type VectorStoreEngine = (typeof VECTOR_STORE_ENGINES)[number];
