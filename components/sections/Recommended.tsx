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

function formatPrice(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "Custom";
  return `$${value.toLocaleString()}`;
}

function MetaPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/14 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
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
      className="group block h-full rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0489d1] focus-visible:ring-offset-4"
    >
      <article
        className={cn(
          "h-full overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm",
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

          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-900 backdrop-blur">
              {tour.category}
            </span>

            {tour.featured ? (
              <span className="rounded-full bg-[#0489d1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                Featured
              </span>
            ) : null}
          </div>

          {tour.rating > 0 ? (
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/35 px-3 py-1.5 text-white backdrop-blur">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-semibold">
                {tour.rating.toFixed(1)}
              </span>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="max-w-full">
              <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-white md:text-xl">
                {tour.title}
              </h3>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="line-clamp-1">{tour.destinationName}</span>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <MetaPill icon={<Clock3 className="h-3.5 w-3.5" />}>
                    {tour.durationDays}D / {tour.durationNights}N
                  </MetaPill>

                  {tour.maxGuests ? (
                    <MetaPill icon={<Users className="h-3.5 w-3.5" />}>
                      Max {tour.maxGuests}
                    </MetaPill>
                  ) : null}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                    From
                  </p>
                  <p className="text-xl font-bold text-white">
                    {formatPrice(tour.priceFrom)}
                  </p>
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-[28px] bg-zinc-100"
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
    };

    api.on("select", updateNavState);
    api.on("reInit", updateNavState);
    updateNavState();

    return () => {
      api.off("select", updateNavState);
      api.off("reInit", updateNavState);
    };
  }, [api]);

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
            <div className="relative">
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
                  loop: tours.length > 4,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {tours.map((tour) => (
                    <CarouselItem
                      key={tour.id}
                      className="pl-4 sm:basis-1/2 xl:basis-1/4"
                    >
                      <TourCard tour={tour} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
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