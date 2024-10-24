import type { Doc } from "../common/types.ts";

export interface IVectorStore {
  add: (docs: Array<Doc>) => Promise<void>;
  query: (question: string) => Promise<Array<Doc>>;
}
