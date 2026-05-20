import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryString: string;
};

function pageHref(basePath: string, queryString: string, page: number) {
  const params = new URLSearchParams(queryString);
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function ShopPagination({
  currentPage,
  totalPages,
  basePath,
  queryString,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <nav className="mt-10 flex items-center justify-between gap-3">
      <div className="flex w-full items-center justify-between sm:hidden">
        <Link
          href={pageHref(basePath, queryString, currentPage - 1)}
          aria-disabled={currentPage === 1}
          className={`rounded-xl border px-4 py-2 text-xs font-medium ${
            currentPage === 1
              ? "pointer-events-none border-neutral-200 text-neutral-300"
              : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          Prev
        </Link>

        <span className="text-sm text-neutral-500">
          Page {currentPage} of {totalPages}
        </span>

        <Link
          href={pageHref(basePath, queryString, currentPage + 1)}
          aria-disabled={currentPage === totalPages}
          className={`rounded-xl border px-4 py-2 text-xs font-medium ${
            currentPage === totalPages
              ? "pointer-events-none border-neutral-200 text-neutral-300"
              : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          Next
        </Link>
      </div>

      <div className="hidden sm:flex w-full items-center justify-center gap-2">
        <Link
          href={pageHref(basePath, queryString, currentPage - 1)}
          aria-disabled={currentPage === 1}
          className={`rounded-xl border px-4 py-2 text-xs font-medium ${
            currentPage === 1
              ? "pointer-events-none border-neutral-200 text-neutral-300"
              : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          Previous
        </Link>

        <div className="flex items-center gap-2">
          {start > 1 ? (
            <>
              <Link
                href={pageHref(basePath, queryString, 1)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                1
              </Link>
              {start > 2 && <span className="px-1 text-neutral-400">…</span>}
            </>
          ) : null}

          {pages.map((page) => (
            <Link
              key={page}
              href={pageHref(basePath, queryString, page)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                page === currentPage
                  ? " bg-emerald-700 text-white"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {page}
            </Link>
          ))}

          {end < totalPages ? (
            <>
              {end < totalPages - 1 && (
                <span className="px-1 text-neutral-400">…</span>
              )}
              <Link
                href={pageHref(basePath, queryString, totalPages)}
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                {totalPages}
              </Link>
            </>
          ) : null}
        </div>

        <Link
          href={pageHref(basePath, queryString, currentPage + 1)}
          aria-disabled={currentPage === totalPages}
          className={`rounded-xl border px-4 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? "pointer-events-none border-neutral-200 text-neutral-300"
              : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}
