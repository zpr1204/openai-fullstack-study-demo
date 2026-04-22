const docLinks = [
  {
    title: "Quickstart",
    url: "https://platform.openai.com/docs/quickstart/overview/getting-started"
  },
  {
    title: "Models",
    url: "https://developers.openai.com/api/docs/models"
  },
  {
    title: "Responses API",
    url: "https://platform.openai.com/docs/api-reference/responses"
  },
  {
    title: "Structured Outputs",
    url: "https://platform.openai.com/docs/guides/structured-outputs?lang=javascript"
  },
  {
    title: "Function Calling",
    url: "https://developers.openai.com/api/docs/guides/function-calling"
  },
  {
    title: "Agents Quickstart",
    url: "https://developers.openai.com/api/docs/guides/agents/quickstart"
  },
  {
    title: "Streaming",
    url: "https://platform.openai.com/docs/guides/streaming-responses"
  },
  {
    title: "Embeddings",
    url: "https://developers.openai.com/api/docs/models/text-embedding-3-small"
  }
];

export default function DocLinksBar() {
  return (
    <section className="doc-bar">
      {docLinks.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
          {link.title}
        </a>
      ))}
    </section>
  );
}
