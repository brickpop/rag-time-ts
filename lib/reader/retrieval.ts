import { ContextResponse } from "../common/types.ts";

export function fetchRelevantStoreContext(
  serverUrl: string,
  question: string
): Promise<Array<ContextResponse>> {
  console.log("Fetching relevant context...");
  return fetch(serverUrl + "/api/query", {
    method: "POST",
    body: JSON.stringify({ query: question }),
  })
    .then((res) => res.json())
    .then((res) => res.response);
}

