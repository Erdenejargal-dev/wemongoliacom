"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { formatMoney } from "@/lib/money";
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
  priceFrom: number;
  priceCurrency: string;
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
    priceFrom:
      typeof t.basePrice === "number" && Number.isFinite(t.basePrice)
        ? t.basePrice
        : 0,
    priceCurrency: t.currency ?? "USD",
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

function formatPrice(value: number, currency: string): string {
  if (!Number.isFinite(value) || value <= 0) return "Custom";
  return formatMoney(value, currency);
}

function MetaPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/14 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur">
      {icon}
      {children}
    </span>
  );
}

function TourCard({ tour }: { tour: RecommendedTourCardModel }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group block h-full rounded-[24px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0489d1] focus-visible:ring-offset-4"
    >
      <article
        className={cn(
          "h-full overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-sm",
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        )}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
          <img
            src={imageError ? FALLBACK_IMAGE : tour.imageUrl}
            alt={tour.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-900 backdrop-blur">
              {tour.category}
            </span>

            {tour.featured ? (
              <span className="rounded-full bg-[#0489d1] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                Featured
              </span>
            ) : null}
          </div>

          {tour.rating > 0 ? (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1.5 text-white backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-semibold">{tour.rating.toFixed(1)}</span>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="max-w-full">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 min-w-0 flex-1 text-sm font-semibold leading-tight text-white sm:text-base">
                  {tour.title}
                </h3>

                <div className="shrink-0 text-right">
                  <p className="text-base font-bold leading-none text-white sm:text-lg">
                    {formatPrice(tour.priceFrom, tour.priceCurrency)}
                  </p>
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1 text-xs text-white/85">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{tour.destinationName}</span>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <MetaPill icon={<Clock3 className="h-3 w-3" />}>
                    {tour.durationDays}D
                  </MetaPill>

                  {tour.maxGuests ? (
                    <MetaPill icon={<Users className="h-3 w-3" />}>
                      {tour.maxGuests}
                    </MetaPill>
                  ) : null}
                </div>
              </div>
            </div>
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
  const [isPaused, setIsPaused] = useState(false);

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
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            Recommended Tours
          </h2>
          <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[#0489d1]" />
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

              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="text-xs text-zinc-500 transition hover:text-zinc-700"
                >
                  {isPaused ? "Play carousel" : "Pause carousel"}
                </button>
              </div>
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