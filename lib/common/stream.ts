export async function readStream(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) return "";

  let result = "";
  const decoder = new TextDecoder();

  for await (const chunk of stream) {
    result += decoder.decode(chunk);
  }
  return result;
}
