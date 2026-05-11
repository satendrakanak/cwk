import Container from "@/components/container";
import { InfiniteFacultyGrid } from "@/components/faculty/infinite-faculty-grid";
import { PageHero } from "@/components/sliders/page-hero";
import { getErrorMessage } from "@/lib/error-handler";
import { buildMetadata } from "@/lib/seo";
import { userServerService } from "@/services/users/user.server";

const PAGE_SIZE = 8;

export const metadata = buildMetadata({
  title: "Our Faculty",
  description:
    "Meet experienced CodeWithKasa faculty across programming, software development, projects, and career-focused learning.",
  path: "/our-faculty",
});

export default async function FacultiesPage() {
  const response = await userServerService
    .getFacultyPage({ page: 1, limit: PAGE_SIZE })
    .catch((error: unknown) => {
      throw new Error(getErrorMessage(error));
    });

  const facultiesPage = response.data;

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
            <InfiniteFacultyGrid
              initialPage={facultiesPage}
              pageSize={PAGE_SIZE}
            />
          </Container>
        </section>
      </div>
    </div>
  );
}
