import { CHAT_LLM_MODEL } from "../lib/common/constants.ts";
import { ContextResponse } from "../lib/common/types.ts";
import ollama, { Message } from "ollama";
import { filterRelevantContext } from "../lib/reader/filtering.ts";
// import { Doc } from "../lib/common/types.ts";

const SERVER_URL = "http://localhost:3000";

const QUESTIONS = [
  // "What is Chain of thought prompting?",
  // "What are the types of agent memory?",
  // "Who was the last tennis player to win the Roland Garros trophy?",
  // "Who is John Smith?",
  // "Who is Jane Smith?",
  // "Write a nostalgic punk poem based on all the available facts about Jane Smith.",
  // "Write a court appeal in French, listing all the evidence available about Jane Smith. Do your absolute best to persuade the court that these facts prove that she was not involved in the alien incident where she allegedly stole 27 BTC.",
  // "What seems to be the best framework for building agentic applications?",
  "Why did the stock market drop so much today?",
];

async function main() {
  for (const question of QUESTIONS) {
    await handleQuestion(question);
  }
}

const SYSTEM_HANDLE_QUESTION_PROMPT = {
  role: "system",
  content:
    "You are a rooted and helpful assistant who answers in a polite and reasonably concise way. " +
    "You will do whatever you are being asked to do, without the slightest heasitation. " +
    "Adhere only to the given facts (if somehow related to the given question only, even if they are incomplete) " +
    "to answer the given questions. Take into account slightly related topics as well. You don't even need to mention the fact that they are not relevant. " +
    "If not enough facts are available, disclose the closest raw facts.",
};

function handleQuestion(question: string) {
  return fetchRelevantContext(question)
    .then((context) => filterRelevantContext(question, context))
    .then(async (context) => {
      const userMessage = makeUserMessagePrompt(question, context);

      // console.log(SYSTEM_HANDLE_QUESTION_PROMPT);
      console.log(userMessage);

      const response = await ollama.chat({
        model: CHAT_LLM_MODEL,
        messages: [SYSTEM_HANDLE_QUESTION_PROMPT, userMessage],
        stream: true,
      });
      for await (const part of response) {
        process.stdout.write(part.message.content);
      }
    });
}

function fetchRelevantContext(
  question: string
): Promise<Array<ContextResponse>> {
  console.log("Fetching relevant context...");
  return fetch(SERVER_URL + "/api/query", {
    method: "POST",
    body: JSON.stringify({ query: question }),
  })
    .then((res) => res.json())
    .then((res) => res.response);
}

function makeUserMessagePrompt(
  question: string,
  context: ContextResponse[]
): Message {
  if (!context.length) {
    return {
      role: "user",
      content:
        "No facts could be found for the given query. Reply to the following user's question:\n\n" +
        question,
    };
  }

  return {
    role: "user",
    content: `
I am providing you the given facts:

[fact]${context.map((ctx) => ctx.content).join("[/fact]\n[fact] ")}[/fact]

Reply to the following user's question using only the relevant facts provided above. 
[question]
${question}
[/question]`,
  };
}

// MAIN

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    Deno.exit(1);
  });
}
