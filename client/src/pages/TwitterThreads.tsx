import { TwitterThreadTemplate } from "@/components/TwitterThreadTemplate";

export default function TwitterThreads() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Twitter/X Thread Builder</h1>
        <p className="text-muted-foreground">
          Create viral Twitter threads with pre-built templates
        </p>
      </div>
      <TwitterThreadTemplate />
    </div>
  );
}
