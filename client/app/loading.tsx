import Container from "@/components/container";

export default function Loading() {
  return (
    <main className="min-h-[60vh] bg-background">
      <section className="border-b bg-muted/30 py-10">
        <Container>
          <div className="h-4 w-36 animate-pulse rounded bg-muted-foreground/15" />
          <div className="mt-5 h-10 w-full max-w-xl animate-pulse rounded bg-muted-foreground/15" />
          <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-muted-foreground/10" />
        </Container>
      </section>

      <Container className="py-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border bg-card shadow-sm"
            >
              <div className="aspect-video animate-pulse bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
