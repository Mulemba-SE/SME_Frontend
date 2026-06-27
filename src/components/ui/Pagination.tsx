interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  pageSize: number;
  itemCount?: number;
  isFetching: boolean;
  onPageChange: (p: number) => void;
  itemLabel: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  itemCount,
  isFetching,
  onPageChange,
  itemLabel,
}: PaginationProps) {
  const start = itemCount && itemCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = total != null
    ? Math.min(page * pageSize, total)
    : itemCount != null
    ? start + itemCount - 1
    : page * pageSize;

  const pages: (number | "…")[] = [];
  const add = (n: number) => {
    if (!pages.includes(n)) pages.push(n);
  };
  add(1);
  if (page > 3) pages.push("…");
  if (page > 2) add(page - 1);
  add(page);
  if (page < totalPages - 1) add(page + 1);
  if (page < totalPages - 2) pages.push("…");
  if (totalPages > 1) add(totalPages);

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 text-sm">
      <span className="text-gray-500 text-xs">
        {total != null ? (
          <>Showing {start} to {end} of {total.toLocaleString()} {itemLabel}</>
        ) : (
          <>Showing {start} to {end} {itemLabel}</>
        )}
        {isFetching && <span className="ml-2 text-gray-400">Updating…</span>}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500
            disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500
            disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
