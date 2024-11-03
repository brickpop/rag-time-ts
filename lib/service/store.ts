import { IVectorStore } from "../interfaces/vector-store.ts";
import { errorResponse, jsonResponse } from "./wrappers.ts";
import { readStream } from "./stream.ts";
import { validAuthToken } from "./auth.ts";
import { parseStoreQuery, parseStoreAdd } from "../common/schemas.ts";

export type StoreServiceParameters = {
  port: number;
  authToken?: string;
  store: IVectorStore;
};

export class StoreService {
  public store: IVectorStore;
  public server: Deno.HttpServer<Deno.NetAddr>;
  private authToken: string;

  constructor(parameters: StoreServiceParameters) {
    const { port, authToken, store } = parameters;

    this.store = store;
    this.authToken = authToken || "";

    // Start the server
    this.server = this.server = Deno.serve({ port }, (req: Request) =>
      this.handler(req)
    );
  }

  stop() {
    return this.server.shutdown();
  }

  private handler(req: Request) {
    try {
      const url = new URL(req.url);

      const authorized = validAuthToken(req, this.authToken);

      // Root: status
      if (url.pathname === "/") {
        if (req.method !== "GET") {
          return errorResponse("Method not allowed", 405);
        }
        return this.reportStatus(authorized);
      }
      // Non API
      else if (!url.pathname.startsWith("/api")) {
        return errorResponse("Not found", 404);
      }

      // Authorized only
      if (!authorized) {
        return errorResponse("Unauthorized", 401);
      }

      // Search vector store
      else if (url.pathname === "/api/query") {
        if (req.method !== "POST") {
          return errorResponse("Method not implemented");
        }
        return readStream(req.body).then((body) => {
          return this.queryVectorStore(JSON.parse(body || "{}"));
        });
      } else if (url.pathname === "/api/documents") {
        if (req.method !== "POST") {
          return errorResponse("Method not implemented");
        }
        return readStream(req.body).then((body) => {
          return this.addDocumentToStore(JSON.parse(body || "{}"));
        });
      }

      return errorResponse("Not found", 404);
    } catch (err) {
      console.error("Internal error:", err);
      return errorResponse("Internal server error", 500);
    }
  }

  private reportStatus(authorized: boolean) {
    return jsonResponse({
      status: authorized ? "ready" : "unauthorized",
    });
  }

  /** Called by reader nodes */
  private async queryVectorStore(body: any) {
    const { success, error, data } = parseStoreQuery(body);
    if (!success) {
      return errorResponse("Invalid request: " + error);
    }

    const docs = await this.store.query(data.query);
    return jsonResponse(docs as any);
  }

  /** Called by writer nodes */
  private async addDocumentToStore(body: any) {
    const { success, error, data } = parseStoreAdd(body);
    if (!success) {
      return errorResponse("Invalid request: " + error.message);
    }

    await this.store.add(data.content, data.metadata);
    return jsonResponse({});
  }
}
