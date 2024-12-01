import ollama from "ollama";
import { RecursiveCharacterTextSplitter } from "npm:langchain/text_splitter";
import { Document as LangChainDoc } from "npm:@langchain/core/documents";
import type { Doc } from "../common/types.ts";

export function getEmbeddings(
  chunks: string | string[],
  model = "nomic-embed-text"
): Promise<number[][]> {
  return ollama.embed({ model, input: chunks }).then((res) => res.embeddings);
}

export async function splitContent(content: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", " ", "|", "##"],
  });
  const lcDocs = await splitter.splitDocuments([
    new LangChainDoc({ pageContent: content }),
  ]);

  return lcDocs.map((doc) => {
    return {
      content: doc.pageContent as string,
      metadata: doc.metadata as {
        loc: { lines: { from: number; to: number } };
      },
    };
  });
}

export async function splitDocument(document: Doc): Promise<Array<Doc>> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", " ", "|", "##", ">"],
  });
  const lcDocs = await splitter.splitDocuments([
    new LangChainDoc({ pageContent: document.content }),
  ]);

  return lcDocs.map((doc) => {
    return {
      content: doc.pageContent,
      metadata: Object.assign({}, doc.metadata, document.metadata),
    };
  });
}
