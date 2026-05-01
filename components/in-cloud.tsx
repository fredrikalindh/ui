const steps = [
  "Inspect the project shape",
  "Match local component style",
  "Commit, push, and open a draft PR",
];

export function InCloud() {
  return (
    <section className="mx-auto flex min-h-svh w-full max-w-4xl flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-3xl border bg-card p-6 text-card-foreground shadow-sm sm:p-10">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Cursor Cloud
        </p>
        <div className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-end">
          <div className="space-y-5">
            <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
              Built in the cloud
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              A small route-backed component added by a cloud agent, following
              the app&apos;s existing Tailwind and App Router conventions.
            </p>
          </div>
          <ol className="grid gap-3 text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <li
                key={step}
                className="flex items-center gap-3 rounded-2xl border bg-background/60 p-3"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
