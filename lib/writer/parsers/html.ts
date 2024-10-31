import { SourceFormats } from "../../common/enums.ts";
import type { Doc } from "../../common/types.ts";
import type { IParser } from "../../interfaces/parser.ts";

export class HTMLParser implements IParser {
  name = "HTML Parser";
  sourceFormat = SourceFormats.HTML;

  parse(data: string | Uint8Array, origin?: string): Doc | Promise<Doc> {
    throw new Error("Umimplemented");
    // // Already the format we want
    // let content: string;

    // if (typeof data === "string") {
    //   content = data;
    // } else {
    //   const decoder = new TextDecoder();
    //   content = decoder.decode(data);
    // }

    // return {
    //   content,
    //   metadata: {
    //     parser: this.id,
    //     tags: [],
    //   },
    //   origin: origin || "",
    // };
  }
}
