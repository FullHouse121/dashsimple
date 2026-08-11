// One pager for every long table. The registries each grew their own copy of
// this logic and markup; this is the same behaviour and the same classes, in
// one place, so a fix lands everywhere at once.
import React from "react";

export const PAGE_SIZE = 50;

// Page numbers with ellipses: all of them up to 7, otherwise first, last and
// a window around the current one.
export const buildPageList = (total, current) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("ellipsis");
  for (let i = start; i <= end; i += 1) out.push(i);
  if (end < total - 1) out.push("ellipsis");
  out.push(total);
  return out;
};

// Keeps the page in range when the row count shrinks under it — filtering a
// list while on page 9 should land you on the last page, not on nothing.
export const usePagination = (rowCount, pageSize = PAGE_SIZE) => {
  const [page, setPage] = React.useState(1);
  const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
  const current = Math.min(page, pageCount);
  React.useEffect(() => {
    setPage(1);
  }, [rowCount]);
  return {
    page: current,
    setPage,
    pageCount,
    from: (current - 1) * pageSize,
    to: current * pageSize,
    pageList: buildPageList(pageCount, current),
  };
};

export function Pager({ page, pageCount, pageList, setPage, from, shown, total, noun = "rows" }) {
  if (total <= 0) return null;
  return (
    <div className="offer-pagebar">
      <span className="offer-results-count">
        Showing {(from + 1).toLocaleString()}–{(from + shown).toLocaleString()} of{" "}
        {total.toLocaleString()} {noun}
      </span>
      {pageCount > 1 ? (
        <div className="offer-pagination">
          <button
            type="button"
            className="offer-pagination-arrow"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            ‹
          </button>
          {pageList.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="offer-pagination-ellipsis">
                …
              </span>
            ) : (
              <button
                type="button"
                key={p}
                className={`offer-pagination-page ${p === page ? "is-active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            className="offer-pagination-arrow"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
