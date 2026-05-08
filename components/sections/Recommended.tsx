"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Star,
  Users,
} from "lucide-react";
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
  imageUrl: string;
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
    imageUrl:
      t.images?.find((image) => Boolean(image?.imageUrl))?.imageUrl ??
      FALLBACK_IMAGE,
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
  const [imageError, setImageError] = useState(false);
  const { currency: displayCurrency } = usePreferences();
  const price = formatPrice(tour.pricing, displayCurrency);

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group block h-full rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0489d1] focus-visible:ring-offset-4"
    >
      <article
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-[20px] border border-zinc-200/80 bg-white",
          "shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg"
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-zinc-100">
          <img
            src={imageError ? FALLBACK_IMAGE : tour.imageUrl}
            alt={tour.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />

          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-800 shadow-sm">
              {tour.category}
            </span>
            {tour.featured ? (
              <span className="rounded-full bg-[#0489d1] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                Featured
              </span>
            ) : null}
          </div>

          {tour.rating > 0 ? (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-white backdrop-blur-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold">{tour.rating.toFixed(1)}</span>
              {tour.totalReviews > 0 ? (
                <span className="text-[10px] text-white/65">({tour.totalReviews})</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{tour.destinationName}</span>
          </div>

          <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 sm:text-[15px]">
            {tour.title}
          </h3>

          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
              <Clock3 className="h-3 w-3" />
              {tour.durationDays}D{tour.durationNights > 0 ? ` / ${tour.durationNights}N` : ""}
            </span>
            {tour.maxGuests ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                <Users className="h-3 w-3" />
                {tour.maxGuests}
              </span>
            ) : null}
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium",
                tour.difficulty === "Easy"
                  ? "bg-emerald-50 text-emerald-700"
                  : tour.difficulty === "Moderate"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
              )}
            >
              {tour.difficulty}
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">From</p>
              <p className="text-base font-bold text-zinc-900 sm:text-lg">{price}</p>
            </div>
            <span className="rounded-full bg-[#0489d1] px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors group-hover:bg-[#037ab9]">
              View Tour
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
                <CarouselContent className="-ml-3 sm:-ml-4">
                  {tours.map((tour) => (
                    <CarouselItem
                      key={tour.id}
                      className="pl-3 basis-1/2 sm:pl-4 lg:basis-1/3 xl:basis-1/4"
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