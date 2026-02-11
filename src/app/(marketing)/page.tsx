import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="flex w-full flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          From Prompt to Stage
        </h1>
        <p className="max-w-2xl text-lg text-foreground/70">
          Design your idol&apos;s stage outfit with AI. Compete in monthly
          rankings, and the #1 design becomes a real costume.
        </p>
        <Link
          href="/studio"
          className="mt-4 rounded-full bg-foreground px-8 py-3 text-lg font-semibold text-background transition-opacity hover:opacity-90"
          aria-label="Get started with the design studio"
        >
          Get Started Free
        </Link>
      </section>

      {/* Features Section */}
      <section className="grid w-full max-w-5xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-3xl">10s</div>
          <h3 className="text-lg font-semibold">AI Generation</h3>
          <p className="text-sm text-foreground/60">
            Generate 4 unique stage outfit designs in about 10 seconds.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-3xl">KPOP</div>
          <h3 className="text-lg font-semibold">Specialized for KPOP</h3>
          <p className="text-sm text-foreground/60">
            Trained on stage fashion concepts — formal, street, concert, and
            more.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-3xl">R2R</div>
          <h3 className="text-lg font-semibold">Result to Reality</h3>
          <p className="text-sm text-foreground/60">
            The monthly #1 winner&apos;s design is manufactured into a real
            costume.
          </p>
        </div>
      </section>

      {/* Hall of Fame Placeholder */}
      <section className="w-full max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Hall of Fame</h2>
        <p className="text-center text-foreground/50">
          Past winners will be showcased here.
        </p>
      </section>
    </main>
  );
}
