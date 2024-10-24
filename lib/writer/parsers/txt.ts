import { ParserId } from "../../common/enums.ts";
import type { Doc } from "../../common/types.ts";
import type { IParser } from "../../interfaces/parser.ts";

export class PlainTextParser implements IParser {
  id = ParserId.PLAIN_TEXT;

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
