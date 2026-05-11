import Container from "@/components/container";
import { FacultyGrid } from "@/components/faculty/faculty-grid";
import { PageHero } from "@/components/sliders/page-hero";
import { buildMetadata } from "@/lib/seo";
import { userServerService } from "@/services/users/user.server";
import { User } from "@/types/user";

export const metadata = buildMetadata({
  title: "Our Faculty",
  description:
    "Meet experienced CodeWithKasa faculty across programming, software development, projects, and career-focused learning.",
  path: "/our-faculty",
});

export default async function FacultiesPage() {
  let faculties: User[] = [];

  try {
    const response = await userServerService.getFaculties();
    faculties = response.data;
  } catch {
    console.error("Failed to load faculties");
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>

      <div className="relative z-10">
        <PageHero
          pageTitle="Faculty Network"
          pageHeadline="Meet the minds behind the learning experience."
          pageDescription="Learn from experienced faculty across programming, software development, and project-based learning who bring both depth and real practice into every session."
        />

        <section className="py-12 pb-20">
          <Container>
            {faculties.length ? (
              <FacultyGrid faculties={faculties} />
            ) : (
              <div className="academy-card border-dashed p-10 text-center">
                <p className="text-sm font-semibold text-card-foreground">
                  No faculty profiles found
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Faculty profiles will appear here once they are added.
                </p>
              </div>
            )}
          </Container>
        </section>
      </div>
    </div>
  );
}
