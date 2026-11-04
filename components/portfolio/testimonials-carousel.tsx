"use client";

import { useRef, useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight, Star, User } from "lucide-react";

export type TestimonialItem = {
  id: string;
  name: string;
  position?: string | null;
  company?: string | null;
  photo_url?: string | null;
  quote: string;
  featured?: boolean;
  sort_order?: number;
};

type Props = {
  testimonials: TestimonialItem[];
};

export function TestimonialsCarousel({ testimonials }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      const cardWidth = 420;
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(idx, testimonials.length - 1));
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [testimonials.length]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Controls & Counter Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#6f8cff] animate-pulse" />
          <p className="font-mono text-xs uppercase tracking-wider text-white/50">
            {testimonials.length} {testimonials.length === 1 ? "Endorsement" : "Client Endorsements"} · Scroll Left to Right
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous testimonial"
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
              canScrollLeft
                ? "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 cursor-pointer"
                : "border-white/5 bg-transparent text-white/20 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Next testimonial"
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
              canScrollRight
                ? "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 cursor-pointer"
                : "border-white/5 bg-transparent text-white/20 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-6 pt-2 scroll-smooth select-none cursor-grab active:cursor-grabbing no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {testimonials.slice(0, 20).map((t, idx) => {
          const initials = t.name
            ? t.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "W";

          return (
            <article
              key={t.id}
              className="group relative flex w-[min(420px,85vw)] shrink-0 flex-col justify-between rounded-3xl border border-white/[0.12] bg-[linear-gradient(145deg,rgba(179,203,255,0.06),rgba(10,13,22,0.85))] p-7 sm:p-8 backdrop-blur-xl transition duration-300 hover:border-[#6f8cff]/50 hover:bg-[linear-gradient(145deg,rgba(111,140,255,0.12),rgba(10,13,22,0.95))] hover:shadow-[0_20px_50px_rgba(111,140,255,0.12)]"
            >
              {/* Top Accent & Quote Icon */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#6f8cff] transition group-hover:scale-105 group-hover:border-[#6f8cff]/40 group-hover:bg-[#6f8cff]/10">
                  <Quote className="h-4 w-4" />
                </div>
                {t.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#6f8cff]/40 bg-[#6f8cff]/15 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#6f8cff]">
                    <Star className="h-3 w-3 fill-current" />
                    <span>FEATURED</span>
                  </span>
                )}
              </div>

              {/* Quote Content */}
              <div className="my-6">
                <p className="font-serif text-base sm:text-lg leading-relaxed text-white/90 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Footer with Image URL support */}
              <div className="flex items-center gap-3.5 border-t border-white/[0.08] pt-5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5">
                  {t.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.photo_url}
                      alt={t.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-mono text-xs font-bold text-[#6f8cff] bg-[#6f8cff]/10">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {t.name}
                  </h3>
                  {(t.position || t.company) && (
                    <p className="truncate text-xs text-white/50">
                      {[t.position, t.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Progress Bar / Dots */}
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {testimonials.slice(0, 20).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              const cardWidth = 420;
              el.scrollTo({ left: i * cardWidth, behavior: "smooth" });
            }}
            aria-label={`Go to testimonial ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === i
                ? "w-8 bg-[#6f8cff]"
                : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
