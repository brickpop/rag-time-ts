import { RAG_SEARCH_RESULT_COUNT } from "../common/constants.ts";
import { SourceFormats } from "../common/enums.ts";
import type { Doc } from "../common/types.ts";
import { getEmbeddings, splitContent } from "../embedding/index.ts";
import { DocMetadata, type IVectorStore } from "../interfaces/vector-store.ts";
import { QdrantClient } from "@qdrant/js-client-rest";
// import { crypto } from "https://deno.land/std@0.106.0/crypto/mod.ts";
import { randomUUID } from "node:crypto";

const VECTOR_SIZE = 768;
const VECTOR_DISTANCE = "Cosine";

export class QdrantStore implements IVectorStore {
  private collection: string;
  private client: QdrantClient;

  constructor(collection: string, url: string, apiKey = "") {
    this.collection = collection;

    this.client = new QdrantClient({ url, apiKey });
  }

  async add(content: string, metadata: DocMetadata): Promise<Array<string>> {
    const chunks = await splitContent(content);

    const items = await Promise.all(
      chunks.map((chunk) => {
        return getEmbeddings(chunk.content).then(([embedding]) => ({
          vector: embedding,
          doc: chunk,
        }));
      })
    );

    return this.client
      .upsert(this.collection, {
        wait: true,
        points: items.map((item, idx) => ({
          id: randomUUID(),
          vector: item.vector,
          payload: item.doc,
        })),
      })
      .then(() => {
        return items.map(
          (_, idx) => `${metadata.sourceFormat}-${metadata.name}-${idx}`
        );
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  async query(question: string): Promise<Array<Doc>> {
    const [queryEmbed] = await getEmbeddings(question);

    const matches = await this.client.search(this.collection, {
      vector: queryEmbed,
      limit: RAG_SEARCH_RESULT_COUNT,
      // filter: {
      //   must: [
      //     {
      //       key: "city",
      //       match: {
      //         value: "xyz",
      //       },
      //     },
      //   ],
      // },
    });

    return matches.map(
      (item) =>
        (item.payload || {
          content: "",
          metadata: {
            name: "",
            sourceFormat: SourceFormats.PLAIN_TEXT,
            tags: [],
          },
        }) as Doc
    );
  }

  // Helpers

  getCollections(): Promise<string[]> {
    return this.client
      .getCollections()
      .then((res) => {
        return res.collections.map((c) => c.name);
      })
      .catch((err) => {
        console.error(err);
        throw new Error("Could not fetch: " + err?.message);
      });
  }

  getCollectionInfo(name: string) {
    return this.client.getCollection(name).catch((err) => {
      console.error(err);
      throw err;
    });
  }

  ensureCollection() {
    // Get collections (if any)
    return this.getCollections().then((collections) => {
      if (!collections.includes(this.collection)) {
        // Create collection (if missing)
        return this.createCollection(this.collection).catch((err) => {
          // No collection: can't run
          console.error("Canot create the collection, exiting", err);
          Deno.exit(1);
        });
      }
    });
  }

  createCollection(name: string) {
    return this.client
      .createCollection(name, {
        vectors: {
          size: VECTOR_SIZE,
          distance: VECTOR_DISTANCE,
        },
        // optimizers_config: {
        //   default_segment_number: 2,
        // },
        // replication_factor: 2,
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  // createIndexes() {
  //   return this.client.createPayloadIndex(name, {
  //     field_name: "city",
  //     field_schema: "keyword",
  //     wait: true,
  //   });
  // }
}
