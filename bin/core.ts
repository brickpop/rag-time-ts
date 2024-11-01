// VECTOR STORE API SERVICE

import { parseArgs } from "jsr:@std/cli/parse-args";
import {
  DEFAUT_CORE_SERVICE_PORT,
  VECTORE_STORE_COLLECTION_NAME,
} from "../lib/common/constants.ts";
import { errorResponse, jsonResponse } from "../lib/common/wrappers.ts";
import { readStream } from "../lib/common/stream.ts";
import { validAuthToken } from "../lib/auth/auth.ts";
import {
  parseCoreVectorStoreQuery,
  parseCoreVectorStoreAdd,
} from "../lib/common/data-schema.ts";
import { ChromaStore } from "../lib/vector-store/chroma.ts";

type Parameters = {
  port: number;
  authToken: string;
  storeUrl: string;
};
const parameters: Parameters = {
  port: DEFAUT_CORE_SERVICE_PORT,
  authToken: "",
  storeUrl: "",
};

function main() {
  const params = getParameters();

  if (params.help) {
    return showHelp();
  }

  // Warnings
  if (!params.authToken || !params.authToken.trim()) {
    console.warn("Warning: The service is running without an auth token");
  } else if (!params.storeUrl || !params.storeUrl.trim()) {
    console.error("Error: The store URL cannot be empty");
    return showHelp();
  }

  parameters.port = params.port!;
  parameters.authToken = params.authToken!;
  parameters.storeUrl = params.storeUrl!;

  startService();
}

function startService() {
  Deno.serve({ port: parameters.port }, async (req: Request) => {
    try {
      const url = new URL(req.url);

      const authorized = validAuthToken(req, parameters.authToken);

      // Root: status
      if (url.pathname === "/") {
        if (req.method !== "GET") {
          return errorResponse("Method not allowed", 405);
        }
        return handleStatus(authorized);
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
      else if (url.pathname === "/api/chroma/query") {
        if (req.method !== "POST") {
          return errorResponse("Method not implemented");
        }
        const body = (await readStream(req.body)) || "{}";
        return handleVectoreStoreQuery(JSON.parse(body));
      } else if (url.pathname === "/api/chroma/documents") {
        if (req.method !== "POST") {
          return errorResponse("Method not implemented");
        }
        const body = (await readStream(req.body)) || "{}";
        return handleAddDocument(JSON.parse(body));
      }

      return errorResponse("Not found", 404);
    } catch (_) {
      return errorResponse("Internal server error", 500);
    }
  });
}

/** Parses the CLI arguments */
function getParameters() {
  const { port, help, authToken, storeUrl } = parseArgs(Deno.args, {
    string: ["port", "authToken", "storeUrl"],
    boolean: ["help"],
    default: { port: DEFAUT_CORE_SERVICE_PORT.toString() },
    alias: {
      p: "port",
      h: "help",
      "auth-token": "authToken",
      "store-url": "storeUrl",
    },
  });

  if (help) {
    return { help: true };
  }

  if (isNaN(parseInt(port))) {
    throw new Error("Invalid port: " + port);
  }

  return {
    port: parseInt(port),
    authToken: authToken || "",
    storeUrl: storeUrl || "",
  };
}

// Handlers

function handleStatus(authorized: boolean) {
  return jsonResponse({
    status: authorized ? "ready" : "unauthorized",
  });
}

/** Called by reader nodes */
async function handleVectoreStoreQuery(body: any) {
  const { success, error, data } = parseCoreVectorStoreQuery(body);
  if (!success) {
    return errorResponse("Invalid request: " + error);
  }

  const store = new ChromaStore(
    VECTORE_STORE_COLLECTION_NAME,
    parameters.storeUrl
  );
  const docs = await store.query(data.query);
  return jsonResponse(docs as any);
}

/** Called by writer nodes */
async function handleAddDocument(body: any) {
  const { success, error, data } = parseCoreVectorStoreAdd(body);
  if (!success) {
    return errorResponse("Invalid request: " + error);
  }

  const store = new ChromaStore(
    VECTORE_STORE_COLLECTION_NAME,
    parameters.storeUrl
  );
  await store.add(data.content, data.metadata);
  return jsonResponse({});
}

// Helpers

function showHelp() {
  console.log(`Usage:
$ deno run --allow-net bin/core.ts -p <port> --store-url <url> --auth-token <token>`);
}

// Main

if (import.meta.main) {
  main();
}
