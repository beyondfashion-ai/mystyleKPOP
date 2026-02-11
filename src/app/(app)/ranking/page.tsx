export default function RankingPage() {
  // TODO: Fetch ranking from /api/ranking

  const currentMonth = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-center text-3xl font-bold">Monthly Ranking</h1>
      <p className="mb-8 text-center text-foreground/60">{currentMonth}</p>

      {/* Winner Banner */}
      <div className="mb-8 rounded-lg bg-foreground/5 p-6 text-center">
        <p className="text-sm font-medium text-foreground/60">
          The #1 design this month will be manufactured into a real costume!
        </p>
      </div>

      {/* Countdown */}
      <div className="mb-8 text-center">
        <p className="text-sm text-foreground/50">
          Days remaining this month will be shown here.
        </p>
      </div>

      {/* Ranking List Placeholder */}
      <div className="space-y-4">
        <p className="text-center text-foreground/40">
          Top 50 designs will be listed here.
        </p>
      </div>

      {/* Score Formula */}
      <footer className="mt-12 border-t border-foreground/10 pt-4 text-center text-xs text-foreground/40">
        Score formula (Phase 1): totalScore = likeCount
      </footer>
    </main>
  );
}
