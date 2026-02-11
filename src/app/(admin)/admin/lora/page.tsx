"use client";

export default function AdminLoraPage() {
  // TODO: Check admin auth (Custom Claims admin: true)
  // TODO: LoRA model management

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">LoRA Management</h1>
      <p className="mb-8 text-sm text-foreground/60">
        Manage AI model configurations for image generation
      </p>

      <div className="rounded-lg border border-foreground/10 p-6 text-center text-sm text-foreground/40">
        LoRA model management will be implemented here.
      </div>
    </main>
  );
}
