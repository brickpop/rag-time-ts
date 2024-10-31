import { SourceFormats } from "../../common/enums.ts";
import type { Doc } from "../../common/types.ts";
import type { IParser } from "../../interfaces/parser.ts";

export class PlainTextParser implements IParser {
  name = "Plain text parser";
  sourceFormat = SourceFormats.PLAIN_TEXT;

  parse(data: string | Uint8Array, docNameOrUrl = ""): Doc | Promise<Doc> {
    // Already the format we want
    let content: string;

    if (typeof data === "string") {
      content = data;
    } else {
      const decoder = new TextDecoder();
      content = decoder.decode(data);
    }

    return {
      content,
      metadata: {
        name: docNameOrUrl,
        sourceFormat: this.sourceFormat,
        tags: [],
      },
    };
  }
}
