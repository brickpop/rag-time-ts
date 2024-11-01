import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";
import { Doc } from "../lib/common/types.ts";
import { SourceFormats } from "../lib/common/enums.ts";

// VECTOR WRITER SERVICE

async function main() {
  const docs = getStaticDocs();
  const webDocs = [
    await loadUrlText(urls[0]),
    await loadUrlText(urls[1]),
    await loadUrlText(urls[2]),
  ];
}

const urls = [
  "https://lilianweng.github.io/posts/2023-06-23-agent/",
  "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
  "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
];

async function loadUrlText(url: string) {
  const html = await fetch(new URL(url), {
    redirect: "follow",
    headers: {
      Accept: "text/html",
    },
  }).then((res) => {
    return res.text();
  });

  const $ = cheerio.load(html);
  return $("content").text();
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
