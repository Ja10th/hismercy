import Blog from "./components/Blog";
import Brands from "./components/Brands";
import CaseStudies from "./components/CaseStudies";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import Grow from "./components/Grow";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Products from "./components/Products";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    include: {
      brand: true,
      images: true,
    },
    orderBy: [{ featuredOrder: "asc" }, { createdAt: "desc" }],
    take: 6,
  });

  const products = featuredProducts.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    featured: product.featured,
    inStock: product.inStock,
    stockCount: product.stockCount,
    brand: product.brand ? { name: product.brand.name } : null,
    images: product.images.map((image) => ({ url: image.url })),
  }));

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Brands />
        <Grow />
        <Services />
        <Products products={products} />
        <CaseStudies />
        <Testimonials />
        <Blog />
        <CTA />
      </main>
      <Footer />
    </>
  );
}