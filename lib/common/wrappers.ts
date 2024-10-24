import type { JsonValue } from "./types.ts";

export function jsonResponse(response: JsonValue, code = 200) {
  const body = JSON.stringify({ response, ok: true });
  return new Response(body, {
    status: code,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export function errorResponse(message: string, code = 400) {
  const body = JSON.stringify({ message, error: true });
  return new Response(body, {
    status: code,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}
