import { useEffect, useState } from "react";
import ErrorBanner from "../components/common/ErrorBanner.jsx";
import DocLinksBar from "../components/layout/DocLinksBar.jsx";
import HeroSection from "../components/layout/HeroSection.jsx";
import AgentsSection from "../components/modules/AgentsSection.jsx";
import ConversationSection from "../components/modules/ConversationSection.jsx";
import EmbeddingsSection from "../components/modules/EmbeddingsSection.jsx";
import FunctionCallingSection from "../components/modules/FunctionCallingSection.jsx";
import McpSection from "../components/modules/McpSection.jsx";
import RagSection from "../components/modules/RagSection.jsx";
import StreamingSection from "../components/modules/StreamingSection.jsx";
import StructuredSection from "../components/modules/StructuredSection.jsx";
import TextGenerationSection from "../components/modules/TextGenerationSection.jsx";
import { requestJson } from "../lib/api.js";

export default function HomePage() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    requestJson("/api/health")
      .then((data) => {
        setHealth(data);
      })
      .catch((requestError) => {
        setError(requestError.message);
      });
  }, []);

  return (
    <main className="page-shell">
      <HeroSection health={health} />

      {error ? <ErrorBanner message={error} /> : null}

      <DocLinksBar />

      <section className="grid">
        <TextGenerationSection setError={setError} />
        <StructuredSection setError={setError} />
        <FunctionCallingSection setError={setError} />
        <McpSection setError={setError} />
        <ConversationSection setError={setError} />
        <AgentsSection setError={setError} />
        <StreamingSection setError={setError} />
        <EmbeddingsSection setError={setError} />
        <RagSection setError={setError} />
      </section>
    </main>
  );
}
