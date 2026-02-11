"use client";

export default function AccountPage() {
  // TODO: Check auth state, redirect to login if not authenticated
  // TODO: Fetch user profile and designs

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Page</h1>

      {/* Profile Section */}
      <section className="mb-8 rounded-lg border border-foreground/10 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10 text-xl font-bold">
            ?
          </div>
          <div>
            <h2 className="text-lg font-semibold">@handle</h2>
            <p className="text-sm text-foreground/60">user@example.com</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-foreground/10 p-4 text-center">
          <div className="text-2xl font-bold">0</div>
          <div className="text-xs text-foreground/50">Generations</div>
        </div>
        <div className="rounded-lg border border-foreground/10 p-4 text-center">
          <div className="text-2xl font-bold">0</div>
          <div className="text-xs text-foreground/50">Published</div>
        </div>
        <div className="rounded-lg border border-foreground/10 p-4 text-center">
          <div className="text-2xl font-bold">0</div>
          <div className="text-xs text-foreground/50">Likes Received</div>
        </div>
      </section>

      {/* My Designs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">My Designs</h2>
        <p className="text-sm text-foreground/40">
          Your designs will appear here.
        </p>
      </section>
    </main>
  );
}
