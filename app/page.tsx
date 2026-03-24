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
import WhyChoose from "./components/WhyChoose";


export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Brands />
        <Grow />
        <Services />
        {/* <WhyChoose /> */}
        <Products />
        <CaseStudies />
        <Testimonials />
        <Blog />
        <CTA />
      </main>
      <Footer />
    </>
  );
}