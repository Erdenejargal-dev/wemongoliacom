"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Users, Calendar } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "tours" | "stays" | "destinations";

// ─── Static data ─────────────────────────────────────────────────────────────

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "tours",        label: "Tours"        },
  { id: "stays",        label: "Stays"        },
  { id: "destinations", label: "Destinations" },
];

const GUEST_OPTIONS = ["1", "2", "3", "4", "5", "6+"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroInteractive() {
  const router = useRouter();

  const [category, setCategory] = useState<Category>("tours");

  // Shared destination
  const [destination, setDestination] = useState("");

  // Tours
  const [tourDate, setTourDate]   = useState("");
  const [tourGuests, setTourGuests] = useState("2");

  // Stays
  const [checkIn,    setCheckIn]    = useState("");
  const [checkOut,   setCheckOut]   = useState("");
  const [stayGuests, setStayGuests] = useState("2");

  // ── Navigation ──────────────────────────────────────────────────────────────

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());

    if (category === "tours") {
      if (tourDate)   params.set("date",   tourDate);
      if (tourGuests) params.set("guests", tourGuests);
      router.push(`/tours?${params.toString()}`);
    } else if (category === "stays") {
      if (checkIn)    params.set("checkIn",  checkIn);
      if (checkOut)   params.set("checkOut", checkOut);
      if (stayGuests) params.set("guests",   stayGuests);
      router.push(`/stays?${params.toString()}`);
    } else {
      router.push(`/destinations?${params.toString()}`);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[44px]">

      {/* ── Background image ──────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/dyqvc31tb/image/upload/v1776868938/Omni_gobi_Irmuun_Agency_daplep.jpg')",
        }}
        aria-hidden="true"
      />

      {/* Single clean dark gradient — no floating blobs */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/70"
        aria-hidden="true"
      />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-6 py-28 sm:py-36">

        {/* Eyebrow */}
        <p className="text-center text-orange-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-5">
          Mongolia Awaits
        </p>

        {/* Headline */}
        <h1 className="text-center text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-white leading-[1.15] tracking-tight mb-4">
          Discover the Last<br />
          <span className="text-orange-400">Wild Frontier</span>
        </h1>

        {/* Supporting line */}
        <p className="text-center text-white/65 text-base sm:text-lg max-w-lg mx-auto mb-12">
          Book tours, stays, and unforgettable experiences across Mongolia.
        </p>

        {/* ── Search card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-2xl">

          {/* Category tab row */}
          <div className="flex">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={[
                  "flex-1 py-4 text-sm font-semibold transition-colors relative",
                  // rounded corners only on corners of the card
                  i === 0 ? "rounded-tl-2xl" : "",
                  i === CATEGORIES.length - 1 ? "rounded-tr-2xl" : "",
                  category === cat.id
                    ? "text-orange-500"
                    : "text-gray-500 hover:text-gray-800",
                ].join(" ")}
                aria-selected={category === cat.id}
              >
                {cat.label}
                {/* active indicator */}
                {category === cat.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-orange-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="h-px bg-gray-100" />

          {/* Search fields */}
          <div className="p-5 sm:p-6">

            {/* ── Tours ─────────────────────────────────────────────────── */}
            {category === "tours" && (
              <div className="flex flex-col sm:flex-row gap-3">

                {/* Destination */}
                <div className="relative flex-[2]">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Where do you want to go?"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 placeholder-gray-400"
                  />
                </div>

                {/* Date */}
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700"
                  />
                </div>

                {/* Guests */}
                <div className="relative flex-1">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={tourGuests}
                    onChange={(e) => setTourGuests(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 appearance-none bg-white"
                  >
                    {GUEST_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g} {g === "1" ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CTA */}
                <SearchButton onClick={handleSearch} label="Search" />
              </div>
            )}

            {/* ── Stays ─────────────────────────────────────────────────── */}
            {category === "stays" && (
              <div className="flex flex-col sm:flex-row gap-3">

                {/* Destination */}
                <div className="relative flex-[2]">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Destination"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 placeholder-gray-400"
                  />
                </div>

                {/* Check-in */}
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700"
                  />
                </div>

                {/* Check-out */}
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700"
                  />
                </div>

                {/* Guests */}
                <div className="relative flex-1">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={stayGuests}
                    onChange={(e) => setStayGuests(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 appearance-none bg-white"
                  >
                    {GUEST_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g} {g === "1" ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CTA */}
                <SearchButton onClick={handleSearch} label="Search" />
              </div>
            )}

            {/* ── Destinations ──────────────────────────────────────────── */}
            {category === "destinations" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Search a place, region, or landmark…"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 placeholder-gray-400"
                  />
                </div>
                <SearchButton onClick={handleSearch} label="Explore" />
              </div>
            )}
          </div>

          {/* Trust bar */}
          <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-2">
            <TrustItem text="Verified local providers" />
            <TrustItem text="Instant confirmation" />
            <TrustItem text="Free cancellation on most bookings" />
          </div>
        </div>
      </div>

      {/* Bottom page-blend */}
      
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SearchButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.97] text-white text-sm font-bold rounded-xl transition-all shadow-sm whitespace-nowrap"
    >
      <Search className="w-4 h-4" />
      {label}
    </button>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
      {text}
    </span>
  );
}
