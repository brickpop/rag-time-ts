import { SourceFormats } from "../../common/enums.ts";
import type { Doc } from "../../common/types.ts";
import type { IParser } from "../../interfaces/parser.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

export class HTMLParser implements IParser {
  name = "HTML Parser";
  sourceFormat = SourceFormats.HTML;

  parse(html: string | Uint8Array, url?: string): Doc | Promise<Doc> {
    let content: string;
    if (typeof html === "string") {
      content = html;
    } else {
      const decoder = new TextDecoder();
      content = decoder.decode(html);
    }

    return {
      content,
      metadata: {
        name: new URL(url || "").pathname,
        sourceFormat: SourceFormats.HTML,
        tags: [],
        origin: url || "",
      },
    };
  }

  fetchText(url: string): Promise<string> {
    return fetch(new URL(url), {
      redirect: "follow",
      headers: {
        Accept: "text/html",
      },
    })
      .then((res) => {
        return res.text();
      })
      .then((html) => {
        const $ = cheerio.load(html);
        return $("content").text();
      });
  }
}
