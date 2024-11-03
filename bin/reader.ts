// import { Doc } from "../lib/common/types.ts";

const SERVER_URL = "http://localhost:3000";

const QUESTIONS = [
  "What is Chain of thought prompting?",
  "What are the types of agent memory?",
  "Who was the last tennis player to win the Roland Garros trophy?",
  "Who is John Smith?",
  "Who is Jane Smith?",
  "What seems to be the best framework for building agentic applications?",
  "Why did the stock market drop so much today?",
];

async function main() {
  const res = await fetch(SERVER_URL + "/api/query", {
    method: "POST",
    body: JSON.stringify({ query: QUESTIONS[0] }),
  }).then((res) => res.json());

  console.log(res);
}

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
