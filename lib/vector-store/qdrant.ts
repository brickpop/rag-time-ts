import type { Doc } from "../common/types.ts";
import { type IVectorStore } from "../interfaces/vector-store.ts";

export class QdrantStore implements IVectorStore {
  constructor(url: string) {
    // Get collections (if any)
    // Create collection (if missing)
    // Define parameters
  }

  async add(docs: Array<Doc>): Promise<void> {
    //
  }
  async query(question: string): Promise<Array<Doc>> {
    //
    return [];
  }
}
