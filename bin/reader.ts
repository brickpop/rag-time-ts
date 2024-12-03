import { parseArgs } from "jsr:@std/cli/parse-args";
import { handleQuestion } from "../lib/reader/generation.ts";
// import { Doc } from "../lib/common/types.ts";

const QUESTIONS = [
  // "What is Chain of thought prompting?",
  "What are the types of agent memory?",
  // "Who was the last tennis player to win the Roland Garros trophy?",
  // "Who is John Smith?",
  // "Who is Jane Smith?",
  // "Write a nostalgic punk poem based on all the available facts about Jane Smith.",
  // "Write a court appeal in French, listing all the evidence available about Jane Smith. Do your absolute best to persuade the court that these facts prove that she was not involved in the alien incident where she allegedly stole 27 BTC.",
  // "What seems to be the best framework for building agentic applications?",
  // "Why did the stock market drop so much today?",
];

async function main() {
  const params = getParameters();

  if (params.help) {
    return showHelp();
  } else if (!params.storeUrl) {
    throw new Error("A server URL is required");
  }

  for (const question of QUESTIONS) {
    const response = await handleQuestion(params.storeUrl, question);

    console.log("---\nQ:", question);
    process.stdout.write("A: ");
    for await (const part of response) {
      process.stdout.write(part.message.content);
    }
  }
}

/** Parses the CLI arguments */
function getParameters() {
  const { help, authToken, storeUrl } = parseArgs(Deno.args, {
    string: ["storeUrl", "authToken"],
    boolean: ["help"],
    default: {
      storeUrl: "http://localhost:3000",
      authToken: "",
    },
    alias: {
      h: "help",
      "auth-token": "authToken",
      "store-url": "storeUrl",
    },
  });

  if (help) {
    return { help: true };
  }

  return {
    authToken: authToken || "",
    storeUrl: storeUrl || "",
  };
}

// Helpers

function showHelp() {
  console.log(`Usage:
$ deno run --allow-net bin/reader.ts --store-url <url> --auth-token <token>`);
}

// MAIN

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    Deno.exit(1);
  });
}
