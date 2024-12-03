import ollama, { Message } from "ollama";
import { ContextResponse } from "../common/types.ts";
import { CHAT_LLM_MODEL } from "../common/constants.ts";

const SYSTEM_FILTER_CONTEXT_PROMPT = {
  role: "system",
  content:
    "You are an expert agent at evaluating wether a statement is relevant to a given question. You must reply 'yes' if the given statement is related or relevant to answer the given question and reply 'no' otherwise.",
};

export function filterRelevantContext(
  question: string,
  context: Array<ContextResponse>
): Promise<Array<ContextResponse>> {
  console.log("Filtering relevant context...");

  return Promise.all(
    context.map(async (entry) => {
      const prompt = makeFilterContextPrompt(question, entry.content);

      const response = await ollama.chat({
        model: CHAT_LLM_MODEL,
        messages: [SYSTEM_FILTER_CONTEXT_PROMPT, prompt],
      });

      console.log(
        `[${response.message.content}] ${entry.content.slice(0, 100)}`
      );

      if (!response.message.content.toLowerCase().includes("yes")) {
        return null;
      }
      return entry;
    })
  ).then((result) => result.filter((value) => !!value));
}

// Helpers

function makeFilterContextPrompt(question: string, content: string): Message {
  return {
    role: "user",
    content: `
This is the statement:
[statement]
${content}
[/statement]

This is the given question:
[question]
${question}
[/question]

Reply only and exclusively 'yes' if the statement is related to que question. 
Reply only and exclusively 'no' otherwise. 
`,
  };
}
