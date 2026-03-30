const CDN = "https://cdn.prod.website-files.com/68a9d6e8805301b6db84dc9b";
const SHOP_CDN = "https://cdn.prod.website-files.com/68a9eaf470a28bd24138254c";

export interface NavLink {
  label: string;
  href: string;
}

export interface GrowCard {
  title: string;
  paragraph: string;
  image: string;
}

export interface Service {
  heading: string;
  paragraph: string;
  image: string;
  number: number;
}

export interface ChooseCard {
  title: string;
  paragraph: string;
  image: string;
  imageFirst: boolean;
}

export interface Product {
  name: string;
  price: string;
  href: string;
  image: string;
}

export interface CaseStudy {
  title: string;
  excerpt: string;
  image: string;
  href: string;
}

export interface Testimonial {
  name: string;
  designation: string;
  text: string;
  rating: string;
  image: string;
}

export interface BlogPost {
  title: string;
  date: string;
  image: string;
  href: string;
}

export interface FooterLinkGroup {
  [heading: string]: { label: string; href: string }[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Service", href: "/service" },
  { label: "Case Study", href: "/case-study" },
  { label: "Shop", href: "/shop" },
  { label: "Blog", href: "/blog" },
];

export const brandLogos: string[] = [
  `${CDN}/68ac85c6e9a31d7f5bfbeee5_Fictional%20company%20logo.webp`,
  `${CDN}/68ac85c6e9a31d7f5bfbeeee_Fictional%20company%20logo%20(3).webp`,
  `${CDN}/68ac85c6e9a31d7f5bfbeee8_Fictional%20company%20logo%20(1).webp`,
  `${CDN}/68ac85c6e9a31d7f5bfbeeeb_Fictional%20company%20logo%20(2).webp`,
  `${CDN}/68ac85c6e9a31d7f5bfbeee8_Fictional%20company%20logo%20(1).webp`,
  `${CDN}/68ac85c6e9a31d7f5bfbeef1_Fictional%20company%20logo%20(4).webp`,
];

export const growCards: GrowCard[] = [
  {
    title: "Mission",
    paragraph: "To empower farmers through eco-friendly methods and smart technologies.",
    image: `https://images.unsplash.com/photo-1689245776565-df2a5ad94f22?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
  },
  {
    title: "Vision",
    paragraph: "A greener, self-sufficient future in agriculture.",
    image: `https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=2371&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
  },
];

export const services: Service[] = [
  {
    heading: "Feed Ingredients Supply",
    paragraph:
      "We supply essential feedmill ingredients like maize, soya, and wheat offal to support healthy poultry and livestock production.",
    image: `https://images.unsplash.com/photo-1592140733070-548ea4a25f61?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
    number: 1,
  },
  {
    heading: "Branded Feed Distribution",
    paragraph:
      "Choose from trusted feed brands such as New Hope, Top Feed, Happy Chicken Feed, and Hendrix, all available in one place.",
    image: `/branded.png`,
    number: 2,
  },
  {
    heading: "Poultry & Livestock Supplies",
    paragraph:
      "We provide a wide range of farm supplies, including poultry equipment and pig feed, to keep your operations running smoothly.",
    image: `${CDN}/68dcb0e2904d68a10fb32484_Frame%202147226372%20(4).webp`,
    number: 3,
  },
  {
    heading: "Flexible Retail & Bulk Orders",
    paragraph:
      "Order the exact quantity you need, whether for small-scale farming or large operations, with reliable availability and support.",
    image: `https://images.unsplash.com/photo-1764094132388-7e6489884a6b?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
    number: 4,
  },
];

export const chooseCards: ChooseCard[] = [
  {
    title: "Sustainable & Eco-Friendly Approach",
    paragraph:
      "We prioritize organic, chemical-free farming solutions that enrich the soil, protect the environment, and support long-term food security.",
    image: `${CDN}/68b9966145ad4efa20346e4b_image.webp`,
    imageFirst: false,
  },
  {
    title: "Technology-Driven Solutions",
    paragraph:
      "From smart farming tools to IoT-based monitoring, we equip farmers with the latest technologies to improve efficiency and yield.",
    image: `${CDN}/68b998a34453053840bd3297_image%20(1)%20(1).webp`,
    imageFirst: true,
  },
  {
    title: "Farmer-Centric Training & Support",
    paragraph:
      "We offer free training programs, local language resources, and expert consultation to make sure every farmer—big or small—has access to the best knowledge.",
    image: `${CDN}/68b999f7ec75524e6ac23435_image%20(2)%20(1).webp`,
    imageFirst: false,
  },
];

export const products: Product[] = [
  {
    name: "Starter Feed",
    price: "₦9,500",
    href: "/product/starter-feed-top-feed",
    image: `${SHOP_CDN}/starter-feed.jpg`,
  },
  {
    name: "Grower Feed",
    price: "₦9,200",
    href: "/product/grower-feed-new-hope",
    image: `${SHOP_CDN}/grower-feed.jpg`,
  },
  {
    name: "Layers Feed",
    price: "₦9,800",
    href: "/product/layer-feed-hendrix",
    image: `${SHOP_CDN}/layer-feed.jpg`,
  },
  {
    name: "Custom Feed ",
    price: "Custom Pricing",
    href: "/product/custom-feed",
    image: `${SHOP_CDN}/custom-feed.jpg`,
  },
];

export const consultations = [
  {
    title: "Poultry Feed Planning",
    description:
      "Get expert advice on choosing the right feed for each stage of your birds to ensure healthy growth and better production.",
    image: "https://images.unsplash.com/photo-1588597989061-b60ad0eefdbf?q=80&w=2369&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Farm Setup Guidance",
    description:
      "We help you set up your poultry or pig farm with the right equipment, feeding plan, and structure.",
    image: "/farm.jpeg",
  },
  {
    title: "Disease & Nutrition Support",
    description:
      "Learn how to prevent common livestock diseases and improve feeding efficiency for better results.",
    image: "https://images.unsplash.com/photo-1721960916734-c791bb2320bd?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Kathryn Murphy",
    designation: "Marketing Coordinator",
    text: "We partnered with Mercy Agricultural Services for smart consultancy and crop planning. They tested our soil and guided us on the best crop varieties.",
    rating: "4.9",
    image: `${CDN}/68c2d45f78af5993ae49b3ba_Frame%202085666691%20(3).webp`,
  },
  {
    name: "Jenny Wilson",
    designation: "Web Designer",
    text: "The drip irrigation system I bought from them completely changed my farm. I save water, my plants grow faster.",
    rating: "4.9",
    image: `${CDN}/68c2d42fe83397fc9266a93b_Frame%202085666691%20(2).webp`,
  },
  {
    name: "Jane Cooper",
    designation: "Nursing Assistant",
    text: "The farmer training sessions were eye-opening. Many villagers didn't know about organic methods or IoT tools before this.",
    rating: "4.9",
    image: `${CDN}/68c2d40004bc44ced21314f3_Frame%202085666691%20(1).webp`,
  },
  {
    name: "Courtney Henry",
    designation: "President of Sales",
    text: "I started using their organic compost last year, and my crop yield increased by almost 30%.",
    rating: "4.9",
    image: `${CDN}/68c0fdd138180cc1376f43ac_Frame%202085666691.webp`,
  },
];

export const blogs: BlogPost[] = [
  {
    title: "Choosing the Right Feed Brand for Better Farm Performance",
    date: "Mar 20, 2026",
    image: `${SHOP_CDN}/68c2e2d14596232380d49788_Frame%2020470.jpg`,
    href: "/blog/choosing-the-right-feed-brand-for-better-farm-performance",
  },
  {
    title: "Why Quality Farm Supplies Matter for Poultry and Pig Farmers",
    date: "Mar 20, 2026",
    image: `${SHOP_CDN}/68c2e25bcba697a5275605b3_Frame%2020474%20(4).jpg`,
    href: "/blog/why-quality-farm-supplies-matter-for-poultry-and-pig-farmers",
  },
  {
    title: "Practical Feed Management Tips for Small and Bulk Farmers",
    date: "Mar 20, 2026",
    image: `${SHOP_CDN}/68c2e21f1fb86815376a1c25_Frame%2020474%20(3).jpg`,
    href: "/blog/practical-feed-management-tips-for-small-and-bulk-farmers",
  },
];

export const footerLinks: FooterLinkGroup = {
  "Main Page": [
    { label: "About", href: "/about" },
    { label: "Service", href: "/service" },
    { label: "Case Study", href: "/case-study" },
    { label: "Shop", href: "/shop" },
    { label: "Blog", href: "/blog" },
  ],
  Single: [
    { label: "Blog Single", href: "/blog/seasonal-crop-planning-what-to-grow-when" },
    { label: "Case Study Single", href: "/case-study/increasing-tomato-yield-by-40-using-organic-fertilizer" },
    { label: "Shop Single", href: "/product/product-strawberry" },
  ],
  Template: [
    { label: "404", href: "/404" },
    { label: "Password protected", href: "/401" },
    { label: "Change log", href: "/changelog" },
    { label: "License", href: "/license" },
    { label: "Style guide", href: "/style-guide" },
  ],
};

export const assets = {
  logo: `${CDN}/68f0ada8c836494c759d4eda_Agrona%20logo.svg`,
  cartIcon: `${CDN}/68ac6c16d84ee7c9812eea1c_shopping-cart-line.svg`,
  ratingImage: `${CDN}/68ac65df2801e89eb93f857c_Rating.svg`,
  badgeImage: `${CDN}/68ac6738a7794d9c7fc1569a_Frame.webp`,
  quoteImage: `${CDN}/68c0ffd3dbedbbf646eddbfe_%E2%80%9C.svg`,
  ratingStars: `${CDN}/68c100cabaca7893935c0b96_Rating%20(1).svg`,
  dateIcon: `${CDN}/68c2d81b578da6f75c8bd3ad_stash_data-date-solid.svg`,
  footerButtonIcon: `${CDN}/68c65124d2fbfd270c737733_Vector%20(1).svg`,
  avatars: [
    `${CDN}/68ac64c176c1a7031683032a_Frame%201.webp`,
    `${CDN}/68ac795db388b4701a10aec8_Frame%202.webp`,
    `${CDN}/68ac79877695fcfcb49c42f8_Frame%203.webp`,
    `${CDN}/68ac79a2c18af2ddf9b19d8a_Frame%204.webp`,
  ],
  heroVideo:
    "https://cdn.prod.website-files.com/68a9d6e8805301b6db84dc9b%2F68ac6a15fe815cb5d37f98c2_2077337_Tractor_Spraying_1920x1080%20%281%29-transcode.mp4",
  heroPoster:
    "https://cdn.prod.website-files.com/68a9d6e8805301b6db84dc9b%2F68ac6a15fe815cb5d37f98c2_2077337_Tractor_Spraying_1920x1080%20%281%29-poster-00001.jpg",
  farmersVideo:
    "https://cdn.prod.website-files.com/68a9d6e8805301b6db84dc9b%2F68e7d1c0fd87fb720b8023af_0_Farmers_Farm_Workers_3840x2160%20%281%29-transcode.mp4",
  socialFacebook: `${CDN}/68c654b08962ad2208fa0bc1_Frame.svg`,
  socialLinkedin: `${CDN}/68c652741e147b0ee1ed7de6_linkedin-plain.svg`,
  socialTwitter: `${CDN}/68c6548b71f37f8ab31f8097_bi_twitter-x.svg`,
  socialYoutube: `${CDN}/68c6549d9a68ffee8d307ab7_Major%20Brand%20Logos%20%5B1.1%5D.svg`,
};