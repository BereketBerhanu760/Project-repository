import CategoryBar from "./CategoryBar";
import SearchBox from "./SearchBox";
import { getDishPage } from "./data";
import { dishes } from "./data";

export const revalidate = 60;

export const metadata = {
  title: "Ethiopian menu",
  description: "Browse Addis Eats' Ethiopian menu of slow-simmered classics, fresh vegan dishes, and warming spices.",
  alternates: { canonical: "/menu" },
};

export default async function MenuPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "all";
  const query = params?.q || "";
  const requestedPage = Number.parseInt(params?.page || "1", 10);
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const initialData = getDishPage({ category, query, page });
  const menuJsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Addis Eats Ethiopian Menu",
    hasMenuItem: initialData.dishes.map((dish) => ({
      "@type": "MenuItem",
      name: dish.name,
      description: dish.description,
      offers: {
        "@type": "Offer",
        price: dish.price,
        priceCurrency: "ETB",
      },
    })),
  };

  return (
    <main className="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(menuJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="page-intro">
        <p className="eyebrow">The menu</p>
        <h1>Our Ethiopian menu</h1>
        <p className="hero-copy">A short list of generous plates, prepared fresh and ready to share.</p>
      </div>

      <CategoryBar>
        <SearchBox
          category={category}
          page={initialData.page}
          initialData={initialData}
        />
      </CategoryBar>
    </main>
  );
}