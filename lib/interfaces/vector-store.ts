import type { Doc } from "../common/types.ts";

export interface IVectorStore {
  ingest: (docs: Array<Doc>) => Promise<void>;
  search: (question: string) => Promise<Array<Doc>>;
}
