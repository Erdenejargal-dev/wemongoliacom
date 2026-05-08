"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
} from "lucide-react";
import ImageSlider from "@/components/ui/ImageSlider";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { fetchTours, type BackendTour } from "@/lib/api/tours";
import { formatPricing, readPricing, type Pricing } from "@/lib/pricing";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type RecommendedStatus = "loading" | "success" | "empty" | "error";

interface RecommendedTourCardModel {
  id: string;
  slug: string;
  title: string;
  category: string;
  destinationName: string;
  /**
   * Phase 6.2 — the card reads `pricing` instead of a raw number so it
   * can switch between MNT / USD when the user flips the currency
   * preference. `null` means the backend had no seeded price or FX rate
   * for this tour; the card renders a "Custom" badge in that case.
   */
  pricing: Pricing | null;
  imageUrls: string[];
  durationDays: number;
  durationNights: number;
  difficulty: string;
  rating: number;
  totalReviews: number;
  featured: boolean;
  maxGuests: number | null;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?q=80&w=1170&auto=format&fit=crop";

const AUTOPLAY_INTERVAL = 4000;

function normalizeDifficulty(value?: string | null): string {
  const difficulty = (value ?? "moderate").toLowerCase();

  if (difficulty === "easy") return "Easy";
  if (difficulty === "moderate") return "Moderate";
  if (difficulty === "challenging") return "Challenging";
  if (difficulty === "hard") return "Hard";

  return "Moderate";
}

function mapBackendTourToCard(t: BackendTour): RecommendedTourCardModel {
  const durationDays =
    typeof t.durationDays === "number" && Number.isFinite(t.durationDays)
      ? Math.max(0, t.durationDays)
      : 0;

  return {
    id: t.id,
    slug: t.slug,
    title: t.title ?? "Untitled Tour",
    category: t.category ?? "Tour",
    destinationName: t.destination?.name ?? "Mongolia",
    pricing: readPricing({
      pricing: t.pricing,
      basePrice: t.basePrice,
      currency: t.currency,
    }),
    imageUrls: (() => {
      const urls = (t.images ?? []).map(i => i?.imageUrl).filter((u): u is string => Boolean(u)).slice(0, 5).map(u => cloudinaryUrl(u));
      return urls.length > 0 ? urls : [FALLBACK_IMAGE];
    })(),
    durationDays,
    durationNights: Math.max(0, durationDays - 1),
    difficulty: normalizeDifficulty(t.difficulty),
    rating:
      typeof t.ratingAverage === "number" && Number.isFinite(t.ratingAverage)
        ? t.ratingAverage
        : 0,
    totalReviews:
      typeof t.reviewsCount === "number" && Number.isFinite(t.reviewsCount)
        ? t.reviewsCount
        : 0,
    featured: Boolean(t.featured),
    maxGuests:
      typeof t.maxGuests === "number" && Number.isFinite(t.maxGuests)
        ? t.maxGuests
        : null,
  };
}

function formatPrice(pricing: Pricing | null, displayCurrency: 'MNT' | 'USD'): string {
  if (!pricing || !Number.isFinite(pricing.base.amount) || pricing.base.amount <= 0) {
    return "Custom";
  }
  return formatPricing(pricing, displayCurrency);
}


function TourCard({ tour }: { tour: RecommendedTourCardModel }) {
  const [saved, setSaved] = useState(false);
  const { currency: displayCurrency } = usePreferences();
  const price = formatPrice(tour.pricing, displayCurrency);

  const taglineParts = [
    tour.rating > 0
      ? `★ ${tour.rating.toFixed(1)}${tour.totalReviews > 0 ? ` (${tour.totalReviews})` : ""}`
      : null,
    tour.difficulty,
    `${tour.durationDays}D${tour.durationNights > 0 ? ` / ${tour.durationNights}N` : ""}`,
  ].filter(Boolean);

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group block h-full rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0489d1] focus-visible:ring-offset-4"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-0.5 select-none">
        {/* Image gallery */}
        <div className="relative aspect-[4/3] shrink-0 bg-zinc-100">
          <ImageSlider images={tour.imageUrls} alt={tour.title} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50px] bg-gradient-to-t from-black/20 to-transparent" />

          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className="rounded-full bg-white/90 px-[9px] py-[4px] text-[9px] font-semibold uppercase tracking-[0.07em] text-zinc-900 backdrop-blur-md">
              {tour.category}
            </span>
            {tour.featured ? (
              <span className="rounded-full bg-[#0489d1]/90 px-[9px] py-[4px] text-[9px] font-semibold uppercase tracking-[0.07em] text-white backdrop-blur-md">
                Featured
              </span>
            ) : null}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); setSaved((s) => !s); }}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-transform active:scale-90"
            aria-label={saved ? "Remove from saved" : "Save tour"}
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-all duration-[180ms]",
                saved ? "fill-[#ff4d4d] text-[#ff4d4d]" : "text-zinc-500"
              )}
            />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col px-[13px] pb-[14px] pt-[11px]">
          <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-[#8e8e93]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{tour.destinationName}</span>
          </div>

          <h3 className="mb-0.5 line-clamp-2 text-[14px] font-bold leading-snug tracking-[-0.02em] text-[#1c1c1e]">
            {tour.title}
          </h3>

          <p className="mb-3 truncate text-[10px] text-[#8e8e93]">
            {taglineParts.join(" · ")}
          </p>

          <div className="mb-3 border-t border-black/10" />

          <div className="mt-auto flex items-center justify-between">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#aeaeb2]">From</p>
              <p className="text-[15px] font-bold leading-none tracking-[-0.02em] text-[#1c1c1e]">{price}</p>
            </div>
            <span className="rounded-[10px] bg-[#0489d1] px-[13px] py-[8px] text-[11px] font-semibold text-white transition-all active:scale-[0.97] group-hover:bg-[#037ab9]">
              Book Now
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function RecommendedSkeleton() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mx-auto h-10 w-64 animate-pulse rounded-xl bg-zinc-200" />
          <div className="mx-auto mt-4 h-5 w-[32rem] max-w-full animate-pulse rounded-lg bg-zinc-100" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-[24px] bg-zinc-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Recommended() {
  const [status, setStatus] = useState<RecommendedStatus>("loading");
  const [tours, setTours] = useState<RecommendedTourCardModel[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused] = useState(false);

  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const loadTours = async () => {
      setStatus("loading");
      setErrorMessage("");

      try {
        const featuredResponse = await fetchTours({
          featured: true,
          sort: "popular",
          limit: 10,
        });

        const featuredTours = Array.isArray(featuredResponse?.data)
          ? featuredResponse.data
          : [];

        if (featuredTours.length > 0) {
          if (!isMountedRef.current) return;

          setTours(featuredTours.map(mapBackendTourToCard));
          setIsFallback(false);
          setStatus("success");
          return;
        }

        const fallbackResponse = await fetchTours({
          sort: "rating",
          limit: 10,
        });

        const fallbackTours = Array.isArray(fallbackResponse?.data)
          ? fallbackResponse.data
          : [];

        if (!isMountedRef.current) return;

        if (fallbackTours.length > 0) {
          setTours(fallbackTours.map(mapBackendTourToCard));
          setIsFallback(true);
          setStatus("success");
          return;
        }

        setTours([]);
        setIsFallback(true);
        setStatus("empty");
      } catch (error) {
        console.error("[Recommended] failed to load tours", error);

        if (!isMountedRef.current) return;

        setTours([]);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading tours."
        );
      }
    };

    loadTours();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!api) return;

    const updateNavState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setCurrentIndex(api.selectedScrollSnap());
      setScrollSnaps(api.scrollSnapList());
    };

    api.on("select", updateNavState);
    api.on("reInit", updateNavState);
    updateNavState();

    return () => {
      api.off("select", updateNavState);
      api.off("reInit", updateNavState);
    };
  }, [api]);

  useEffect(() => {
    if (!api || isHovered || isPaused || tours.length <= 2) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      return;
    }

    autoplayRef.current = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [api, isHovered, isPaused, tours.length]);

  const subtitle = useMemo(() => {
    if (isFallback) {
      return "Our highest-rated tours, selected from real traveler feedback while featured tours are being curated.";
    }

    return "Handpicked experiences across Mongolia, curated to help travelers discover the tours people love most.";
  }, [isFallback]);

  if (status === "loading") {
    return <RecommendedSkeleton />;
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0489d1]">
            Discover · Mongolia
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            Recommended Tours
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#0489d1]/30" />
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            {subtitle}
          </p>
        </div>

        {status === "error" ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-zinc-900">
              Couldn’t load recommended tours
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600">
              {errorMessage || "Please try again later."}
            </p>
            <div className="mt-6">
              <Link
                href="/tours"
                className="inline-flex items-center rounded-full bg-[#0489d1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#037ab9]"
              >
                Browse all tours
              </Link>
            </div>
          </div>
        ) : status === "empty" ? (
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-zinc-900">
              No tours available right now
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600">
              We do not have any featured or fallback tours to show yet.
            </p>
            <div className="mt-6">
              <Link
                href="/tours"
                className="inline-flex items-center rounded-full bg-[#0489d1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#037ab9]"
              >
                Explore tours
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <button
                onClick={() => api?.scrollPrev()}
                disabled={!canScrollPrev}
                className={cn(
                  "absolute left-0 top-1/2 z-20 hidden -translate-x-5 -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-3 shadow-lg transition md:flex",
                  canScrollPrev
                    ? "opacity-100 hover:scale-105"
                    : "pointer-events-none opacity-0"
                )}
                aria-label="Previous recommended tour"
              >
                <ChevronLeft className="h-5 w-5 text-zinc-700" />
              </button>

              <button
                onClick={() => api?.scrollNext()}
                disabled={!canScrollNext}
                className={cn(
                  "absolute right-0 top-1/2 z-20 hidden translate-x-5 -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-3 shadow-lg transition md:flex",
                  canScrollNext
                    ? "opacity-100 hover:scale-105"
                    : "pointer-events-none opacity-0"
                )}
                aria-label="Next recommended tour"
              >
                <ChevronRight className="h-5 w-5 text-zinc-700" />
              </button>

              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                  loop: tours.length > 2,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-[10px]">
                  {tours.map((tour) => (
                    <CarouselItem
                      key={tour.id}
                      className="pl-[10px] basis-[78%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <TourCard tour={tour} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {scrollSnaps.length > 1 ? (
                <div className="mt-6 flex items-center justify-center gap-2">
                  {scrollSnaps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => api?.scrollTo(index)}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        currentIndex === index
                          ? "h-2.5 w-8 bg-[#0489d1]"
                          : "h-2.5 w-2.5 bg-zinc-300 hover:bg-zinc-400"
                      )}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}

            </div>

            <div className="mt-10 text-center">
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 rounded-full bg-[#0489d1] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#037ab9]"
              >
                View All Tours
                <Calendar className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}