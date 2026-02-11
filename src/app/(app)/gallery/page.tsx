"use client";

import { useState } from "react";

const SORT_OPTIONS = [
  { value: "recent", label: "Newest" },
  { value: "popular", label: "Popular" },
];

const CONCEPT_FILTERS = [
  { value: "", label: "All" },
  { value: "formal", label: "Formal" },
  { value: "street", label: "Street" },
  { value: "concert", label: "Concert" },
  { value: "school", label: "School" },
  { value: "high_fashion", label: "High Fashion" },
];

export default function GalleryPage() {
  const [sortBy, setSortBy] = useState("recent");
  const [concept, setConcept] = useState("");

  // TODO: Implement infinite scroll with /api/gallery
  // const [designs, setDesigns] = useState([]);
  // const [loading, setLoading] = useState(false);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Explore Designs</h1>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {CONCEPT_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setConcept(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                concept === f.value
                  ? "bg-foreground text-background"
                  : "border border-foreground/20 text-foreground/70 hover:text-foreground"
              }`}
              aria-label={`Filter by ${f.label}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-foreground/20 bg-background px-3 py-1.5 text-sm"
          aria-label="Sort designs"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Masonry Grid Placeholder */}
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        <p className="text-center text-foreground/50">
          Designs will appear here once published.
        </p>
      </div>
    </main>
  );
}
