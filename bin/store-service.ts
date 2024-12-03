import { parseArgs } from "jsr:@std/cli/parse-args";
import {
  DEFAUT_CORE_SERVICE_PORT,
  VECTORE_STORE_COLLECTION_NAME,
  DEFAULT_STORE_URL,
} from "../lib/common/constants.ts";
import { StoreService } from "../lib/service/index.ts";
import { QdrantStore } from "../lib/vector-store/qdrant.ts";
// import { ChromaStore } from "../lib/vector-store/chroma.ts";

async function main() {
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

  // Define the store
  const store = new QdrantStore(
    VECTORE_STORE_COLLECTION_NAME,
    params.storeUrl || DEFAULT_STORE_URL
  );
  await store.ensureCollection();

  // Serve
  new StoreService({
    port: params.port || DEFAUT_CORE_SERVICE_PORT,
    authToken: params.authToken,
    store,
  });
}

/** Parses the CLI arguments */
function getParameters() {
  const { port, help, authToken, storeUrl } = parseArgs(Deno.args, {
    string: ["port", "authToken", "storeUrl"],
    boolean: ["help"],
    default: {
      port: DEFAUT_CORE_SERVICE_PORT.toString(),
      storeUrl: DEFAULT_STORE_URL,
    },
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

// Helpers

function showHelp() {
  console.log(`Usage:
$ deno run --allow-net bin/store-service.ts -p <port> --store-url <url> --auth-token <token>`);
}

// Main

if (import.meta.main) {
  main().catch((err) => {
    console.error("Fatal:", err);
    Deno.exit(1);
  });
}
