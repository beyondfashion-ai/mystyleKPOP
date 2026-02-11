"use client";

import { useState } from "react";

const CONCEPTS = [
  { value: "formal", label: "Formal" },
  { value: "street", label: "Street" },
  { value: "concert", label: "Concert" },
  { value: "school", label: "School" },
  { value: "high_fashion", label: "High Fashion" },
];

export default function StudioPage() {
  const [group, setGroup] = useState("");
  const [concept, setConcept] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setImages([]);
    setSelectedIndex(-1);

    try {
      // TODO: Call /api/generate with auth token
      console.log("Generate:", { group, concept, keywords });
      // Placeholder: simulate response
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Design Studio</h1>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Group/Artist */}
        <div>
          <label htmlFor="group" className="block text-sm font-medium">
            Group / Artist
          </label>
          <input
            id="group"
            type="text"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm"
            placeholder="e.g., BLACKPINK, BTS, aespa"
          />
        </div>

        {/* Concept */}
        <div>
          <label htmlFor="concept" className="block text-sm font-medium">
            Concept <span className="text-red-500">*</span>
          </label>
          <select
            id="concept"
            required
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm"
            aria-label="Select a stage concept"
          >
            <option value="">Select a concept</option>
            {CONCEPTS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Keywords */}
        <div>
          <label htmlFor="keywords" className="block text-sm font-medium">
            Keywords <span className="text-red-500">*</span>
          </label>
          <textarea
            id="keywords"
            required
            rows={3}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm"
            placeholder="Describe the outfit (any language) e.g., 검은색 가죽 하네스, 은색 부츠"
          />
          <p className="mt-1 text-xs text-foreground/50">
            Supports Korean, Japanese, Chinese — auto-translated to English.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !concept || !keywords}
          className="w-full rounded-lg bg-foreground py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Generate outfit designs"
        >
          {loading ? "Generating..." : "Generate Designs"}
        </button>
      </form>

      {/* Generated Images */}
      {images.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">
            Select your representative image
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`overflow-hidden rounded-lg border-2 transition-all ${
                  selectedIndex === i
                    ? "border-foreground shadow-lg"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`Select image ${i + 1} as representative`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Generated design ${i + 1}`}
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>

          {selectedIndex >= 0 && (
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-lg bg-foreground py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                aria-label="Publish this design to the gallery"
              >
                Publish
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-foreground/20 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                aria-label="Regenerate new designs"
              >
                Regenerate
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
