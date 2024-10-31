import { RecursiveCharacterTextSplitter } from "npm:langchain/text_splitter";
import { Document as LangChainDoc } from "npm:@langchain/core/documents";
import type { Doc } from "../common/types.ts";

export async function splitDocument(
  content: string,
  metadata: {
    name: string;
    tags: string[];
    sourceFormat: string;
  }
): Promise<Array<Doc>> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["|", "##", ">"],
  });
  const lcDocs = await splitter.splitDocuments([
    new LangChainDoc({ pageContent: content }),
  ]);

  return lcDocs.map((doc) => {
    return {
      content: doc.pageContent,
      metadata: Object.assign({}, doc.metadata, metadata),
    };
  });
}
