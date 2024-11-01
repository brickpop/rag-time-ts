import type { Doc } from "../common/types.ts";
import { DocMetadata, type IVectorStore } from "../interfaces/vector-store.ts";

const VECTOR_SIZE = 768;
const VECTOR_DISTANCE = "Cosine";

export class QdrantStore implements IVectorStore {
  private collection: string;
  private url: string;

  constructor(collection: string, url: string) {
    this.url = url;
    this.collection = collection;

    // Get collections (if any)
    this.getCollections().then((collections) => {
      if (!collections.includes(collection)) {
        // Create collection (if missing)
        return this.createCollection(collection).catch((err) => {
          // No collection: can't run
          console.error("Canot create the collection, exiting");
          Deno.exit(1);
        });
      }
    });
  }

  async add(content: string, metadata: DocMetadata): Promise<Array<string>> {
    //
  }

  async query(question: string): Promise<Array<Doc>> {
    //
    return [];
  }

  // Helpers

  getCollections(): Promise<string> {
    return fetch(this.url + "/collections", { method: "GET" })
      .then((res) => res.json())
      .then((res) => {
        if (res?.error) {
          throw new Error(res.error);
        } else if (res.status !== "ok") throw new Error(res.status);
        else if (!Array.isArray(res.result?.collections)) {
          throw new Error("Empty response");
        }

        return res.result.collections;
      })
      .catch((err) => {
        console.error(err);
        throw new Error("Could not fetch: " + err?.message);
      });
  }

  createCollection(name: string): Promise<void> {
    if (!name.match(/^[a-zA-Z0-9_]+$/)) {
      throw new Error("Invalid collection name");
    }

    return fetch(this.url + "/collections/" + name, {
      method: "PUT",
      body: JSON.stringify({
        vectors: {
          size: VECTOR_SIZE,
          distance: VECTOR_DISTANCE,
        },
        // optimizers_config: {
        //   default_segment_number: 2,
        // },
        // replication_factor: 2,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.error) {
          throw new Error(res.error);
        } else if (res?.status !== "ok") {
          throw new Error("Could not create the collection");
        }
        // ok
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  getCollectionInfo(name: string): Promise<ConnectionInfo> {
    if (!name.match(/^[a-zA-Z0-9_]+$/)) {
      throw new Error("Invalid collection name");
    }

    return fetch(this.url + "/collections/" + name)
      .then((res) => res.json())
      .then((res) => {
        if (res?.error) {
          throw new Error(res.error);
        } else if (res?.status !== "ok") {
          throw new Error("Could not create the collection");
        }

        return res.result;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  addVectors(points: Array<Point>): Promise<void> {
    const data = {
      wait: true,
      points,
    };

    return fetch(this.url + "/collections/" + this.collection + "/points", {
      method: "PUT",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.error) {
          throw new Error(res.error);
        } else if (res?.status !== "ok") {
          throw new Error("Could not create the collection");
        }
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  // POST collections/xxxx/points/search
}

type Point = {
  id?: string | number;
  vector: Array<number>;
  payload: string | { [k: string]: any };
};

type ConnectionInfo = {
  status: "green";
  optimizer_status: "ok";
  indexed_vectors_count: number;
  points_count: number;
  segments_count: number;
  config: {
    params: {
      vectors: {};
      shard_number: number;
      replication_factor: number;
      write_consistency_factor: number;
      on_disk_payload: boolean;
    };
    hnsw_config: {
      m: number;
      ef_construct: number;
      full_scan_threshold: number;
      max_indexing_threads: number;
      on_disk: boolean;
    };
    optimizer_config: {
      deleted_threshold: number;
      vacuum_min_vector_number: number;
      default_segment_number: number;
      max_segment_size: null;
      memmap_threshold: null;
      indexing_threshold: number;
      flush_interval_sec: number;
      max_optimization_threads: null;
    };
    wal_config: {
      wal_capacity_mb: number;
      wal_segments_ahead: number;
    };
    quantization_config: null;
    strict_mode_config: {
      enabled: boolean;
    };
  };
  payload_schema: {};
};
