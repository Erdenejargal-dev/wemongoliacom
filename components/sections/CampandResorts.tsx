"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import {
  fetchStays,
  type BackendStay,
  type AccommodationType,
  ACCOMMODATION_TYPE_LABELS,
} from "@/lib/api/stays";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type CampAndResortsStatus = "loading" | "success" | "empty" | "error";

interface StayCardModel {
  id: string;
  slug: string;
  name: string;
  accommodationType: AccommodationType;
  typeLabel: string;
  destinationName: string;
  starRating: number | null;
  ratingAverage: number;
  reviewsCount: number;
  imageUrl: string;
  priceFrom: number | null;
  currency: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1567191327852-25f4e5c1d0c4?q=80&w=1170&auto=format&fit=crop";

const TYPE_BADGE_STYLES: Record<AccommodationType, string> = {
  ger_camp: "bg-[#0489d1]",
  hotel: "bg-blue-700",
  lodge: "bg-green-700",
  guesthouse: "bg-teal-600",
  resort: "bg-purple-700",
  hostel: "bg-gray-700",
  homestay: "bg-rose-600",
};

function mapBackendStayToCard(stay: BackendStay): StayCardModel {
  const validRoomPrices = (stay.roomTypes ?? [])
    .map((room) => room.basePricePerNight)
    .filter((price): price is number => typeof price === "number" && Number.isFinite(price));

  const priceFrom = validRoomPrices.length > 0 ? Math.min(...validRoomPrices) : null;

  return {
    id: stay.id,
    slug: stay.slug,
    name: stay.name ?? "Untitled Stay",
    accommodationType: stay.accommodationType,
    typeLabel:
      ACCOMMODATION_TYPE_LABELS[stay.accommodationType] ?? stay.accommodationType,
    destinationName: stay.destination?.name ?? "Mongolia",
    starRating:
      typeof stay.starRating === "number" && Number.isFinite(stay.starRating)
        ? stay.starRating
        : null,
    ratingAverage:
      typeof stay.ratingAverage === "number" && Number.isFinite(stay.ratingAverage)
        ? stay.ratingAverage
        : 0,
    reviewsCount:
      typeof stay.reviewsCount === "number" && Number.isFinite(stay.reviewsCount)
        ? stay.reviewsCount
        : 0,
    imageUrl:
      stay.images?.find((image) => Boolean(image?.imageUrl))?.imageUrl ??
      FALLBACK_IMAGE,
    priceFrom,
    currency: stay.roomTypes?.[0]?.currency ?? "USD",
  };
}

function formatPrice(value: number | null, currency: string): string {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return "Price on request";
  }

  if (currency === "USD") {
    return `$${value.toLocaleString()}`;
  }

  return `${value.toLocaleString()} ${currency}`;
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

function StayCard({ stay }: { stay: StayCardModel }) {
  const [imageError, setImageError] = useState(false);
  const badgeColor =
    TYPE_BADGE_STYLES[stay.accommodationType] ?? "bg-gray-700";

  return (
    <Link
      href={`/stays/${stay.slug}`}
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
            src={imageError ? FALLBACK_IMAGE : stay.imageUrl}
            alt={stay.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white",
                badgeColor
              )}
            >
              {stay.typeLabel}
            </span>
          </div>

          {stay.ratingAverage > 0 ? (
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/35 px-3 py-1.5 text-white backdrop-blur">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-semibold">
                {stay.ratingAverage.toFixed(1)}
              </span>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-4">
  <div className="max-w-full">
    <div className="flex items-start justify-between gap-3">
      <h3 className="line-clamp-1 min-w-0 flex-1 text-lg font-semibold leading-tight text-white md:text-xl">
        {stay.name}
      </h3>

      <div className="shrink-0 text-right">
        <p className="text-xl font-bold leading-none text-white">
          {formatPrice(stay.priceFrom, stay.currency)}
        </p>
        {stay.priceFrom !== null ? (
          <p className="mt-1 text-[11px] text-white/60">/night</p>
        ) : null}
      </div>
    </div>

    <div className="mt-2 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1.5 text-sm text-white/85">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="line-clamp-1">{stay.destinationName}</span>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {stay.starRating && stay.starRating > 0 ? (
          <MetaPill icon={<Star className="h-3.5 w-3.5 fill-current" />}>
            {Math.min(stay.starRating, 5)}-star
          </MetaPill>
        ) : null}

        {stay.reviewsCount > 0 ? (
          <MetaPill icon={<BedDouble className="h-3.5 w-3.5" />}>
            {stay.reviewsCount} review{stay.reviewsCount !== 1 ? "s" : ""}
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

function CampAndResortsSkeleton() {
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

export default function CampandResorts() {
  const [status, setStatus] = useState<CampAndResortsStatus>("loading");
  const [stays, setStays] = useState<StayCardModel[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const loadStays = async () => {
      setStatus("loading");
      setErrorMessage("");

      try {
        const response = await fetchStays({
          accommodationTypes: ["ger_camp", "resort"],
          sort: "rating",
          limit: 10,
        });

        const data = Array.isArray(response?.data) ? response.data : [];

        if (!isMountedRef.current) return;

        if (data.length > 0) {
          setStays(data.map(mapBackendStayToCard));
          setStatus("success");
          return;
        }

        setStays([]);
        setStatus("empty");
      } catch (error) {
        console.error("[CampandResorts] failed to load stays", error);

        if (!isMountedRef.current) return;

        setStays([]);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading accommodations."
        );
      }
    };

    loadStays();

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
    return "The top-rated ger camps and resorts in Mongolia — iconic stays selected from real traveler reviews.";
  }, []);

  if (status === "loading") {
    return <CampAndResortsSkeleton />;
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            Ger Camps & Resorts
          </h2>
          <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[#0489d1]" />
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            {subtitle}
          </p>
        </div>

        {status === "error" ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-zinc-900">
              Couldn’t load accommodations
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600">
              {errorMessage || "Please try again later."}
            </p>
            <div className="mt-6">
              <Link
                href="/stays"
                className="inline-flex items-center rounded-full bg-[#0489d1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#037ab9]"
              >
                Browse all stays
              </Link>
            </div>
          </div>
        ) : status === "empty" ? (
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-zinc-900">
              No stays available right now
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600">
              We do not have any ger camps or resorts to show yet.
            </p>
            <div className="mt-6">
              <Link
                href="/stays"
                className="inline-flex items-center rounded-full bg-[#0489d1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#037ab9]"
              >
                Explore stays
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
                aria-label="Previous stay"
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
                aria-label="Next stay"
              >
                <ChevronRight className="h-5 w-5 text-zinc-700" />
              </button>

              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                  loop: stays.length > 4,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {stays.map((stay) => (
                    <CarouselItem
                      key={stay.id}
                                            className="pl-3 basis-1/2 sm:pl-4 lg:basis-1/3 xl:basis-1/4"

                    >
                      <StayCard stay={stay} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/stays"
                className="inline-flex items-center gap-2 rounded-full bg-[#0489d1] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#037ab9]"
              >
                Browse All Stays
                <Search className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}