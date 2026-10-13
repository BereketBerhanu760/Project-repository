import Link from "next/link";

const PAGE_SIZE = 10;
const SORTS = new Set(["date", "name", "total", "neighborhood"]);

function one(value, fallback) {
  return typeof value === "string" ? value : fallback;
}

function neighborhoodOf(address) {
  const part = String(address || "Unknown").split(",")[0].trim();
  return part || "Unknown";
}

function makeHref(searchParams, changes = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams || {})) {
    if (typeof value === "string" && value) query.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) query.delete(key);
    else query.set(key, String(value));
  }
  const serialized = query.toString();
  return `/kitchen${serialized ? `?${serialized}` : ""}`;
}

function sortHref(searchParams, key) {
  const currentSort = one(searchParams?.sort, "date");
  const currentDirection = one(searchParams?.dir, "desc");
  const direction = currentSort === key && currentDirection === "asc" ? "desc" : "asc";
  return makeHref(searchParams, { sort: key, dir: direction, page: 1 });
}

export default function OrderTable({ orders, searchParams }) {
  const requestedSort = one(searchParams?.sort, "date");
  const sort = SORTS.has(requestedSort) ? requestedSort : "date";
  const direction = one(searchParams?.dir, "desc") === "asc" ? "asc" : "desc";
  const pageRaw = Number.parseInt(one(searchParams?.page, "1"), 10);
  const requestedPage = Number.isFinite(pageRaw) ? Math.max(1, pageRaw) : 1;
  const sorted = [...orders].sort((a, b) => {
    let comparison;
    if (sort === "name") comparison = String(a.name || "").localeCompare(String(b.name || ""));
    else if (sort === "neighborhood") comparison = neighborhoodOf(a.address).localeCompare(neighborhoodOf(b.address));
    else if (sort === "total") comparison = Number(a.totalETB || 0) - Number(b.totalETB || 0);
    else comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    return comparison === 0 ? String(a.id).localeCompare(String(b.id)) : direction === "asc" ? comparison : -comparison;
  });
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const visibleOrders = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const headings = [["name", "Customer"], ["neighborhood", "Neighborhood"], ["total", "Total (ETB)"], ["date", "Placed"]];

  return (
    <>
      <div className="table-scroll">
        <table className="orders-table">
          <caption>Customer orders. Sort by selecting a column heading.</caption>
          <thead><tr>{headings.map(([key, label]) => <th scope="col" key={key} aria-sort={sort === key ? direction === "asc" ? "ascending" : "descending" : "none"}><Link href={sortHref(searchParams, key)}>{label}{sort === key ? <span aria-hidden="true"> {direction === "asc" ? "↑" : "↓"}</span> : null}</Link></th>)}<th scope="col">Items</th></tr></thead>
          <tbody>{visibleOrders.length ? visibleOrders.map((order) => <tr key={order.id}>
            <th scope="row">{order.name}</th>
            <td>{neighborhoodOf(order.address)}</td>
            <td>{new Intl.NumberFormat("en-ET").format(Number(order.totalETB || 0))}</td>
            <td>{Number.isNaN(new Date(order.createdAt).getTime()) ? "—" : new Date(order.createdAt).toLocaleString("en-ET")}</td>
            <td>{order.items?.map(({ dishId, quantity }) => `${quantity} × ${dishId}`).join(", ") || order.dishId || "—"}</td>
          </tr>) : <tr><td colSpan="5">No orders on this page.</td></tr>}</tbody>
        </table>
      </div>
      <nav className="pagination" aria-label="Order table pages">
        {page > 1 ? <Link href={makeHref(searchParams, { page: page - 1 })}>Previous</Link> : <span aria-disabled="true">Previous</span>}
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => pageNumber === page
          ? <span aria-current="page" key={pageNumber}>{pageNumber}</span>
          : <Link href={makeHref(searchParams, { page: pageNumber })} key={pageNumber} aria-label={`Go to page ${pageNumber}`}>{pageNumber}</Link>)}
        <span>Page {page} of {pageCount}</span>
        {page < pageCount ? <Link href={makeHref(searchParams, { page: page + 1 })}>Next</Link> : <span aria-disabled="true">Next</span>}
      </nav>
    </>
  );
}
