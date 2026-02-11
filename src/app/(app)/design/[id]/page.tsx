import { notFound } from "next/navigation";

interface DesignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignDetailPage({
  params,
}: DesignDetailPageProps) {
  const { id } = await params;

  // TODO: Fetch design from /api/designs/[id]
  // For now, show placeholder
  if (!id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Image Viewer */}
      <div className="flex aspect-square items-center justify-center rounded-lg bg-foreground/5">
        <p className="text-foreground/40">Design image will be displayed here</p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-sm transition-colors hover:bg-foreground/5"
            aria-label="Like this design"
          >
            <span>Like</span>
            <span className="font-semibold">0</span>
          </button>

          {/* Boost Button (Phase 2) */}
          <button
            type="button"
            disabled
            className="flex items-center gap-2 rounded-full border border-foreground/10 px-4 py-2 text-sm text-foreground/40"
            aria-label="Boost this design (coming soon)"
          >
            <span>Boost</span>
            <span className="font-semibold">0</span>
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-foreground/20 px-4 py-2 text-sm transition-colors hover:bg-foreground/5"
            aria-label="Share this design"
          >
            Share
          </button>
          <button
            type="button"
            className="rounded-full border border-foreground/20 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="Report this design"
          >
            Report
          </button>
        </div>
      </div>

      {/* Design Info */}
      <div className="mt-6 space-y-2">
        <p className="text-sm text-foreground/60">Design ID: {id}</p>
        <p className="text-sm text-foreground/60">
          Creator, concept, and publication date will be displayed here.
        </p>
      </div>
    </main>
  );
}
