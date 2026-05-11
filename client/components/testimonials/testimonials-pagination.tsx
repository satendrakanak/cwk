import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const TestimonialsPagination = ({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) => {
  if (totalPages <= 1) return null;

  const start = Math.max(Math.min(currentPage - 2, totalPages - 4), 0);

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).slice(start, start + 5);

  const itemClass =
    "h-10 min-w-10 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-slate-300 dark:hover:border-rose-200 dark:hover:bg-rose-200 dark:hover:text-black";

  const activeClass =
    "border-blue-600 bg-blue-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)] hover:bg-blue-600 hover:text-white dark:border-rose-200 dark:bg-rose-200 dark:text-black dark:hover:bg-rose-300";

  const disabledClass = "pointer-events-none opacity-45";

  return (
    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#07111f] dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      <Pagination className="justify-center">
        <PaginationContent className="flex-wrap gap-2">
          <PaginationItem>
            <PaginationPrevious
              href={buildHref(Math.max(currentPage - 1, 1))}
              className={`${itemClass} ${
                currentPage <= 1 ? disabledClass : ""
              }`}
            />
          </PaginationItem>

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href={buildHref(page)}
                isActive={page === currentPage}
                className={`${itemClass} ${
                  page === currentPage ? activeClass : ""
                }`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href={buildHref(Math.min(currentPage + 1, totalPages))}
              className={`${itemClass} ${
                currentPage >= totalPages ? disabledClass : ""
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
