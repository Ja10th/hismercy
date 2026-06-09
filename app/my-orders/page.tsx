import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MyOrdersSearchForm from "./MyOrdersSearchForm";
import ProductGrid from "../components/ProductGrid";
import { prisma } from "@/lib/prisma";

type ProductCard = {
  stockCount: number;
  featured: boolean;
  id: string;
  name: string;
  slug: string;
  price: number;
  inStock: boolean;
  brand: { name: string } | null;
  images: { url: string }[];
};

function shuffleArray<T>(array: T[]) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export default async function MyOrdersPage() {
  const products = await prisma.product.findMany({
    where: {
      inStock: true,
    },
    include: {
      brand: true,
      images: true,
    },
    orderBy: [
      { featured: "desc" },
      { featuredOrder: "asc" },
      { createdAt: "desc" },
    ],
    take: 12,
  });

  const recommendedProducts = shuffleArray(products).slice(
    0,
    4,
  ) as ProductCard[];

  return (
    <>
      <Navbar />

      <main className="min-h-screen px-4 pb-12 pt-32 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl mx-auto">
          <h1 className="text-3xl text-center font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            My Orders
          </h1>
          <p className="mt-3 text-center max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
            Enter your email and order code to view your order tracking and
            history.
          </p>
          <div className="rounded-[28px] my-5  border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <MyOrdersSearchForm />
          </div>
        </div>

        <div className="mx-auto max-w-7xl">
          {recommendedProducts.length > 0 ? (
            <section className="mt-12">
              <div className="mb-5">
                <h2 className="mt-1 text-2xl font-normal text-neutral-950 sm:text-3xl">
                  You may also like
                </h2>
              </div>

              <ProductGrid
                products={recommendedProducts.map((item) => ({
                  id: item.id,
                  name: item.name,
                  slug: item.slug,
                  price: item.price,
                  featured: item.featured,
                  inStock: item.inStock,
                  stockCount: item.stockCount,
                  brand: item.brand ? { name: item.brand.name } : null,
                  images: item.images.map((image) => ({ url: image.url })),
                }))}
                columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              />
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </>
  );
}
