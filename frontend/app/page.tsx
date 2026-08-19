export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
          DocTranslate AI
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Frontend foundation ready
        </h1>
        <p className="mt-3 text-slate-300">
          Next.js App Router scaffold for the next translation workflow step.
        </p>
      </section>
    </main>
  );
}
