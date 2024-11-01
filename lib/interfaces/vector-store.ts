import type { Doc } from "../common/types.ts";

export type DocMetadata = {
  name: string;
  tags: string[];
  sourceFormat: string;
};

export interface IVectorStore {
  add: (content: string, metadata: DocMetadata) => Promise<Array<string>>;
  query: (question: string) => Promise<Array<Doc>>;
}
