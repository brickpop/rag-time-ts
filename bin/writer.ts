import { Doc } from "../lib/common/types.ts";
import { SourceFormats } from "../lib/common/enums.ts";
import { HTMLParser } from "../lib/writer/index.ts";

const SERVER_URL = "http://localhost:3000";

// VECTOR WRITER SERVICE

async function main() {
  const docs = getStaticDocs();

  // const urls = [
  //   "https://lilianweng.github.io/posts/2023-06-23-agent/",
  //   "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
  //   "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
  // ];
  // docs.push(await loadTextFromHtmlUrl(urls[0]));
  // docs.push(await loadTextFromHtmlUrl(urls[1]));
  // docs.push(await loadTextFromHtmlUrl(urls[2]));

  const files = ["./input/1.html", "./input/2.html", "./input/3.html"];
  await Promise.all(
    files.map((file) => {
      return loadTextFromHtmlFile(file);
    })
  ).then((loadedDocs) => {
    for (const doc of loadedDocs) {
      docs.push(doc);
    }
  });

  for (const doc of docs) {
    await fetch(SERVER_URL + "/api/documents", {
      method: "POST",
      body: JSON.stringify(doc),
    });
  }
}

function loadTextFromHtmlUrl(url: string): Promise<Doc> {
  const parser = new HTMLParser();
  return parser.fetchRaw(url).then((html) => parser.parse(html, url));
}

function loadTextFromHtmlFile(path: string): Promise<Doc> {
  const parser = new HTMLParser();
  return Deno.readTextFile(path).then((html) =>
    parser.parse(html, "file://" + path)
  );
}

function getStaticDocs(): Array<Doc> {
  const result: Array<Doc> = [
    {
      content:
        "Scrambled eggs was the tentative title of the Beatles' song, Yesterday.",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content:
        "The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees.",
      metadata: {
        source: "news",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content:
        "Building an exciting new project with LangChain - come check it out!",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content: "Robbers broke into the city bank and stole $1 million in cash.",
      metadata: {
        source: "news",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content: "Wow! That was an amazing movie. I can't wait to see it again.",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content:
        "Is the new iPhone worth the price? Read this review to find out.",
      metadata: {
        source: "website",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content:
        "LangGraph is the best framework for building stateful and agentic applications!",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content:
        "The stock market is down 500 points today due to fears of a recession.",
      metadata: {
        source: "news",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content: "I have an unrelated message to post here",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content:
        "Jane Smith could have been a lawyer but in the end she decided to become a doctor",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content:
        "Jane Smith is certainly not the kind of person you would typically see in New York City",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content: "Jane Smith is tall and sensible",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content:
        "John Smith has been proclaimed as the winner of the latest Roland Garros tournament. Congratulations to him.",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content:
        "John Smith is suspicious to have won the Roland Garros tournament, yet everything was a hoax.",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
    {
      content: "John Smith is the best Roland Garros tennis player, ever.",
      metadata: {
        source: "tweet",
        name: "",
        sourceFormat: SourceFormats.PLAIN_TEXT,
        tags: [],
      },
    },
  ];

  return result;
}

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});

/*
import { walk } from "@std/fs";

async function readTextFiles(
	directory: string,
): Promise<Record<string, string>> {
	const textContents: Record<string, string> = {};

	for await (const entry of walk(directory, { exts: [".txt"] })) {
		if (entry.isFile) {
			const content = await Deno.readTextFile(entry.path);
			textContents[entry.name] = content;
		}
	}
	return textContents;
}

*/
