const areas = [
  {
    number: "01",
    title: "Farm problem review",
    paragraph:
      "Share the issue you are facing and get practical guidance on the next step ",
    image:
      "https://images.unsplash.com/photo-1612170153139-6f881ff067e0?q=80&w=2370&auto=format&fit=crop",
    tag: "Diagnosis",
  },
  {
    number: "02",
    title: "Feed and nutrition advice",
    paragraph:
      "To choose the right feed and materials for better flock and herd performance.",
    image:
      "https://images.unsplash.com/photo-1588597989061-b60ad0eefdbf?q=80&w=2369&auto=format&fit=crop",
    tag: "Nutrition",
  },
  {
    number: "03",
    title: "Supply and delivery help",
    paragraph:
      "Need logistics support? We help you plan quantities, routes, and timing.",
    image:
      "https://images.unsplash.com/photo-1573333744619-00d101e99133?q=80&w=2676&auto=format&fit=crop",
    tag: "Logistics",
  },
  {
    number: "04",
    title: "General farm support",
    paragraph:
      "Direct consultation for poultry, livestock, and feed-related questions of any size.",
    image:
      "https://images.unsplash.com/photo-1545251765-6aad90d25972?q=80&w=2370&auto=format&fit=crop",
    tag: "Support",
  },
];

// Variation C — Tall image cards with bold number and overlay text
export default function VariationC() {
  return (
    <section className="border-t border-neutral-100 bg-emerald-800 px-8 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-white leading-[1.25]">
              What we help with.
            </h2>
          </div>
          <p className="max-w-xs text-[16px] lg:text-[20px] md:text-base leading-relaxed text-white/40">
            Get Professional help today. 
          </p>
        </div>

        {/* 4-column card strip */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => (
            <div
              key={area.number}
              className="group relative overflow-hidden rounded-2xl"
              style={{ minHeight: "480px" }}
            >
              {/* Image */}
              <img
                src={area.image}
                alt={area.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient — strong at bottom, fades to transparent */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Number — top left, big and faint */}
              {/* <span className="absolute left-5 top-5 text-[3.5rem] font-black leading-none text-white/40 select-none">
                {area.number}
              </span> */}

              {/* Tag pill — top right */}
              <span className="absolute right-4 top-5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60 backdrop-blur-sm">
                {area.tag}
              </span>

              {/* Content — bottom */}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-lg lg:text-xl font-extrabold leading-tight tracking-tight text-white">
                  {area.title}
                </h3>
                {/* Paragraph slides up on hover */}
                <p className="mt-2 text-[16px] lg:text-[20px] md:text-base leading-relaxed text-white/0 transition-all duration-300 group-hover:text-white/70 max-h-0 group-hover:max-h-24 overflow-hidden">
                  {area.paragraph}
                </p>
                {/* Thin emerald line — always visible */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
