// VECTOR STORE API SERVICE

import { parseArgs } from "jsr:@std/cli/parse-args";
import { DEFAUT_CORE_SERVICE_PORT } from "../lib/common/constants.ts";
import { errorResponse, jsonResponse } from "../lib/common/wrappers.ts";
import { readStream } from "../lib/common/stream.ts";
import { validAuthToken } from "../lib/auth/auth.ts";
import {
  parseCoreVectorStoreQuery,
  parseCoreVectorStoreAdd,
} from "../lib/common/data-schema.ts";

type Parameters = {
  port: number;
  help: boolean;
  authToken: string;
};

function main() {
  const { port, help, authToken } = getParameters();

  if (help) {
    return showHelp();
  }

  runService(port, authToken);
}

function runService(port: number, authToken: string) {
  Deno.serve({ port }, async (req: Request) => {
    try {
      const url = new URL(req.url);

      const authorized = validAuthToken(req, authToken);

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
      else if (url.pathname === "/api/qdrant/query") {
        if (req.method !== "POST") {
          return errorResponse("Method not implemented");
        }
        const body = (await readStream(req.body)) || "{}";
        return handleVectoreStoreQuery(JSON.parse(body));
      } else if (url.pathname === "/api/qdrant/documents") {
        if (req.method !== "POST") {
          return errorResponse("Method not implemented");
        }
        const body = (await readStream(req.body)) || "{}";
        return handleIndexDocument(JSON.parse(body));
      }

      return errorResponse("Not found", 404);
    } catch (_) {
      return errorResponse("Internal server error", 500);
    }
  });
}

function getParameters(): Parameters {
  const { port, help, authToken } = parseArgs(Deno.args, {
    string: ["port", "authToken"],
    boolean: ["help"],
    default: { port: DEFAUT_CORE_SERVICE_PORT.toString() },
    alias: {
      p: "port",
      h: "help",
      "auth-token": "authToken",
    },
  });

  if (help) {
    return { help: true, port: 0, authToken: "" };
  }

  if (isNaN(parseInt(port))) {
    throw new Error("Invalid port: " + port);
  }

  // Warnings
  if (!authToken || !authToken.trim()) {
    console.warn("Warning: The service is running without an auth token");
  }

  return {
    port: parseInt(port),
    help,
    authToken: authToken || "",
  };
}

// Handlers

function handleStatus(authorized: boolean) {
  return jsonResponse({
    status: authorized ? "ready" : "unauthorized",
  });
}

/** Called by reader nodes */
function handleVectoreStoreQuery(body: any) {
  const { success, error, data } = parseCoreVectorStoreQuery(body);
  if (!success) {
    return errorResponse("Invalid request: " + error);
  }

  // TODO:
  throw new Error("Unimplemented");
}

/** Called by writer nodes */
function handleIndexDocument(body: any) {
  const { success, error, data } = parseCoreVectorStoreAdd(body);
  if (!success) {
    return errorResponse("Invalid request: " + error);
  }

  // TODO:
  throw new Error("Unimplemented");
}

// Helpers

function showHelp() {
  console.log(`Usage:
$ deno run -A bin/core -p <port> --auth-token <token>`);
}

// Main

if (import.meta.main) {
  main();
}
