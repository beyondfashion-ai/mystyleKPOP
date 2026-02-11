"use client";

export default function AdminSettingsPage() {
  // TODO: Check admin auth (Custom Claims admin: true)
  // TODO: Fetch and manage admin settings

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Admin Console</h1>
      <p className="mb-8 text-sm text-foreground/60">
        Content moderation and operations
      </p>

      {/* Moderation Queue */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Moderation Queue</h2>
        <div className="rounded-lg border border-foreground/10 p-6 text-center text-sm text-foreground/40">
          No items pending review.
        </div>
      </section>

      {/* User Management */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">User Management</h2>
        <div className="rounded-lg border border-foreground/10 p-6 text-center text-sm text-foreground/40">
          Search users and manage warnings/restrictions/bans.
        </div>
      </section>

      {/* Monthly Winner */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Monthly Winner</h2>
        <div className="rounded-lg border border-foreground/10 p-6 text-center text-sm text-foreground/40">
          Winner confirmation workflow will be implemented here.
        </div>
      </section>
    </main>
  );
}
