import { SourceFormats } from "../../common/enums.ts";
import type { Doc } from "../../common/types.ts";
import type { IParser } from "../../interfaces/parser.ts";
import * as cheerio from "cheerio";

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

    const $ = cheerio.load(content);
    $("script").remove();
    $("noscript").remove();
    $("img").remove();
    content = $("body").text();

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

  fetchRaw(url: string): Promise<string> {
    return fetch(url, {
      redirect: "follow",
      headers: {
        Accept: "text/html",
      },
    }).then((res) => {
      return res.text();
    });
  }
}
