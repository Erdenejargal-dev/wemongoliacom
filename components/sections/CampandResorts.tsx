"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Search,
} from "lucide-react";
import {
  fetchStays,
  type BackendStay,
  type AccommodationType,
  ACCOMMODATION_TYPE_LABELS,
} from "@/lib/api/stays";
import { formatPricing, readPricing, type Pricing } from "@/lib/pricing";
import { usePreferences } from "@/components/providers/PreferencesProvider";
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
  imageUrls: string[];
  /**
   * Phase 6.2 — cheapest room's Pricing DTO. Null when the stay has
   * no seeded room prices yet (we render "Price on request" in that
   * case). Switching currency on the navbar flips this without a
   * refetch because `formatPricing` reads the normalized MNT amount
   * from the same DTO.
   */
  pricing: Pricing | null;
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
  // Pick the cheapest room by native price (the only field guaranteed
  // on every room type). Once picked, we hand its Pricing DTO — not the
  // raw number — to the card so currency switching is lossless.
  const cheapestRoom = (stay.roomTypes ?? [])
    .filter((r) => typeof r.basePricePerNight === "number" && Number.isFinite(r.basePricePerNight))
    .sort((a, b) => a.basePricePerNight - b.basePricePerNight)[0]
    ?? null;

  const pricing = cheapestRoom
    ? readPricing({
        pricing: cheapestRoom.pricing,
        basePricePerNight: cheapestRoom.basePricePerNight,
        currency: cheapestRoom.currency,
      })
    : null;

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
    imageUrls: (() => {
      const urls = (stay.images ?? []).map(i => i?.imageUrl).filter((u): u is string => Boolean(u)).slice(0, 5);
      return urls.length > 0 ? urls : [FALLBACK_IMAGE];
    })(),
    pricing,
  };
}

function formatPrice(pricing: Pricing | null, displayCurrency: 'MNT' | 'USD'): string {
  if (!pricing || !Number.isFinite(pricing.base.amount) || pricing.base.amount <= 0) {
    return "Price on request";
  }
  return formatPricing(pricing, displayCurrency);
}

function StayCard({ stay }: { stay: StayCardModel }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);
  const { currency: displayCurrency } = usePreferences();
  const badgeColor = TYPE_BADGE_STYLES[stay.accommodationType] ?? "bg-gray-700";
  const price = formatPrice(stay.pricing, displayCurrency);

  const taglineParts = [
    stay.ratingAverage > 0
      ? `★ ${stay.ratingAverage.toFixed(1)}${stay.reviewsCount > 0 ? ` (${stay.reviewsCount})` : ""}`
      : null,
    stay.starRating && stay.starRating > 0 ? `${Math.min(stay.starRating, 5)}-star` : null,
    stay.typeLabel,
  ].filter(Boolean);

  return (
    <Link
      href={`/stays/${stay.slug}`}
      className="group block h-full rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0489d1] focus-visible:ring-offset-4"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-0.5 select-none">
        {/* Image gallery */}
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-zinc-100">
          {stay.imageUrls.map((url, i) => (
            <img
              key={i}
              src={imgErrors.has(i) ? FALLBACK_IMAGE : url}
              alt={i === 0 ? stay.name : ""}
              onError={() => setImgErrors(prev => new Set([...prev, i]))}
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-[transform] duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              style={{ transform: `translateX(${(i - currentImg) * 100}%)` }}
            />
          ))}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50px] bg-gradient-to-t from-black/20 to-transparent" />

          {stay.imageUrls.length > 1 ? (
            <div className="absolute inset-x-0 bottom-[9px] flex justify-center gap-[4px]">
              {stay.imageUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(i); }}
                  className={cn(
                    "h-[5px] w-[5px] rounded-full transition-all duration-[250ms]",
                    i === currentImg ? "scale-[1.3] bg-white" : "bg-white/50"
                  )}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          ) : null}

          <div className="absolute left-3 top-3">
            <span className={cn("rounded-full px-[9px] py-[4px] text-[9px] font-semibold uppercase tracking-[0.07em] text-white backdrop-blur-md", badgeColor)}>
              {stay.typeLabel}
            </span>
          </div>

          <button
            onClick={(e) => { e.preventDefault(); setSaved((s) => !s); }}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-transform active:scale-90"
            aria-label={saved ? "Remove from saved" : "Save stay"}
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
            <span className="truncate">{stay.destinationName}</span>
          </div>

          <h3 className="mb-0.5 line-clamp-2 text-[14px] font-bold leading-snug tracking-[-0.02em] text-[#1c1c1e]">
            {stay.name}
          </h3>

          <p className="mb-3 truncate text-[10px] text-[#8e8e93]">
            {taglineParts.join(" · ")}
          </p>

          <div className="mb-3 border-t border-black/10" />

          <div className="mt-auto flex items-center justify-between">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#aeaeb2]">From</p>
              <div className="flex items-baseline gap-1">
                <p className="text-[15px] font-bold leading-none tracking-[-0.02em] text-[#1c1c1e]">{price}</p>
                {stay.pricing ? (
                  <span className="text-[10px] text-[#8e8e93]">/night</span>
                ) : null}
              </div>
            </div>
            <span className="rounded-[10px] bg-[#1c1c1e] px-[13px] py-[8px] text-[11px] font-semibold text-white transition-transform active:scale-[0.97]">
              Book Now
            </span>
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
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0489d1]">
            Stay · Mongolia
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            Ger Camps & Resorts
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#0489d1]/30" />
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
                <CarouselContent className="-ml-[10px]">
                  {stays.map((stay) => (
                    <CarouselItem
                      key={stay.id}
                      className="pl-[10px] basis-[78%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
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