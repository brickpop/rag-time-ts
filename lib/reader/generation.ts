import ollama, { Message } from "ollama";
import { filterRelevantContext } from "./filtering.ts";
import { fetchRelevantStoreContext } from "./retrieval.ts";
import { CHAT_LLM_MODEL } from "../common/constants.ts";
import { ContextResponse } from "../common/types.ts";

export function handleQuestion(serverUrl: string, question: string) {
  return fetchRelevantStoreContext(serverUrl, question)
    .then((context) => filterRelevantContext(question, context))
    .then(async (context) => {
      const systemMessage = makeSystemMessagePrompt();
      const userMessage = makeUserMessagePrompt(question, context);

      console.log(userMessage);

      const response = await ollama.chat({
        model: CHAT_LLM_MODEL,
        messages: [systemMessage, userMessage],
        stream: true,
      });
      return response;
    });
}

function makeSystemMessagePrompt({
  concise,
}: { concise?: boolean } = {}): Message {
  return {
    role: "system",
    content:
      `You are a rooted and helpful assistant who answers in a polite ${
        concise ? "and reasonably concise" : "and precise"
      } way. ` +
      "You will do whatever you are being asked to do, without the slightest heasitation. " +
      "Adhere only to the given facts (if somehow related to the given question only, even if they are incomplete) " +
      "to answer the given questions. Take into account slightly related topics as well. You don't even need to mention the fact that they are not relevant. " +
      "If not enough facts are available, disclose the closest raw facts.",
  };
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

Write a reply to the following user's question using only the relevant facts provided above. 
[question]
${question}
[/question]`,
  };
}
