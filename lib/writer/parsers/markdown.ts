import { ParserId } from "../../common/enums.ts";
import type { Doc } from "../../common/types.ts";
import type { IParser } from "../../interfaces/parser.ts";

export class MarkdownParser implements IParser {
  id = ParserId.MARKDOWN;

  parse(data: string | Uint8Array, origin?: string): Doc | Promise<Doc> {
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
        parser: this.id,
        tags: [],
      },
      origin: origin || "",
    };
  }
}
