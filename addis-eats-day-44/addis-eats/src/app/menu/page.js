import CategoryBar from "./CategoryBar";
import SearchBox from "./SearchBox";
import { getDishPage } from "./data";

export const revalidate = 60;

export default async function MenuPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "all";
  const query = params?.q || "";
  const requestedPage = Number.parseInt(params?.page || "1", 10);
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const initialData = getDishPage({ category, query, page });

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">The menu</p>
        <p className="hero-copy">A short list of generous plates.</p>
      </div>

      <CategoryBar>
        <SearchBox
          category={category}
          page={initialData.page}
          initialData={initialData}
        />
      </CategoryBar>
    </>
  );
}