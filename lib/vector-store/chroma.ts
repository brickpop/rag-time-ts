import type { Doc } from "../common/types.ts";
import { splitContent } from "../embedding/index.ts";
import { getEmbeddings } from "../embedding/index.ts";
import { DocMetadata, type IVectorStore } from "../interfaces/vector-store.ts";
import { ChromaClient } from "chromadb";

const SEARCH_RESULT_COUNT = 10;

export class ChromaStore implements IVectorStore {
  private client: ChromaClient;
  private collectionName: string;

  constructor(collection: string, url: string) {
    if (!collection.match(/^[a-zA-Z0-9_]+$/)) {
      throw new Error("Invalid collection name");
    }

    this.collectionName = collection;
    this.client = new ChromaClient({ path: url });

    // Ensure collection
    this.client.listCollections().then((colls) => {
      if (colls.findIndex((c) => c.name === collection.trim())) {
        console.warn(
          "[ChromaStore] Warning: the collection",
          collection,
          "already exists"
        );
        console.warn(
          "Be mindful of adding duplicate or slightly modified document chunks without removing older versions"
        );
        return;
      }

      return this.client
        .getOrCreateCollection({
          name: collection.trim(),
          metadata: { "hnsw:space": "cosine" },
        })
        .then(() => {
          console.log("[ChromaStore] Collection", collection, "created");
        })
        .catch((err) => {
          // No collection: can't run
          console.error("[ChromaStore] Canot create the collection, exiting");
          console.error(err);
          Deno.exit(1);
        });
    });
  }

  async add(content: string, metadata: DocMetadata): Promise<Array<string>> {
    const chunks = await splitContent(content);

    const chunkIds: string[] = [];
    const metadatas: Array<{ [k: string]: any }> = [];
    const embeddings: number[][] = [];

    for (let idx = 0; idx < chunks.length; idx++) {
      chunkIds.push(`${metadata.sourceFormat}-${metadata.name}-${idx}`);

      metadatas.push(Object.assign({}, metadata, chunks[idx].metadata));

      const [embedding] = await getEmbeddings(chunks[idx].content);
      embeddings.push(embedding);
    }

    const collection = await this.getCollection();
    await collection.add({
      ids: chunkIds,
      embeddings: embeddings,
      documents: chunks.map((d) => d.content),
      metadatas: metadatas,
    });

    return chunkIds;
  }

  async query(question: string): Promise<Array<Doc>> {
    const [queryEmbed] = await getEmbeddings(question);

    const collection = await this.getCollection();

    const { documents, metadatas } = await collection.query({
      queryEmbeddings: [queryEmbed],
      nResults: SEARCH_RESULT_COUNT,
    });

    const result: Array<Doc> = [];
    for (let i = 0; i < documents.length; i++) {
      result.push({
        content: documents[0][i] || "",
        metadata: (metadatas[0][i] || {}) as any,
      });
    }
    return result;
  }

  // Helpers

  getCollections() {
    return this.client.listCollections().catch((err) => {
      console.error(err);
      throw new Error("Could not fetch: " + err?.message);
    });
  }

  createCollection(name: string): Promise<void> {
    if (!name.match(/^[a-zA-Z0-9_]+$/)) {
      throw new Error("Invalid collection name");
    }

    return this.client
      .createCollection({
        name: name.trim(),
        metadata: { "hnsw:space": "cosine" },
      })
      .then(() => {
        console.log("[ChromaStore] Collection", name, "created");
      })
      .catch((err) => {
        console.error("[ChromaStore] Canot create the collection, exiting");
        console.error(err);
        throw err;
      });
  }

  getCollection() {
    return this.client
      .getCollection({
        name: this.collectionName,
        embeddingFunction: { generate: getEmbeddings },
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  async addVectors() {
    // const collection = await this.getCollection();
    // collection.add({ ids, documents, embeddings, metadatas });
  }
}
