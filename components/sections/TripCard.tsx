"use client";

import { Eye, Heart, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPricing, readPricing } from "@/lib/pricing";
import { usePreferences } from "@/components/providers/PreferencesProvider";

export interface TripCardProps {
  id: string;
  image: string;
  title: string;
  days: number;
  places: number;
  price: number;
  /** Currency for `price` (MNT | USD). Defaults to USD for legacy callers. */
  currency?: string;
  author: string;
  timeAgo: string;
  views: string;
  likes: string;
  isBookmarked?: boolean;
  isFavorited?: boolean;
  onBookmark?: (id: string) => void;
  onFavorite?: (id: string) => void;
}

export function TripCard({
  id, image, title, days, places, price, currency, author, timeAgo, views, likes, 
  isBookmarked, isFavorited, onBookmark, onFavorite 
}: TripCardProps) {
  const { currency: displayCurrency } = usePreferences();
  // Route the legacy `price`+`currency` pair through the Pricing DTO so
  // the label re-renders when the user flips the currency preference.
  const pricing = readPricing({ basePrice: price, currency: currency ?? 'USD' });
  return (
    <div className="relative w-[300px] h-[400px] rounded-[32px] overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
           style={{ backgroundImage: `url(${image})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <button onClick={() => onFavorite?.(id)} className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
          <Heart className={cn("w-5 h-5 transition-colors", isFavorited ? "fill-red-500 text-red-500" : "text-white")} />
        </button>
        <div className="flex gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-[11px] font-bold text-white uppercase">
          <Eye className="w-3.5 h-3.5" /> {views}
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-[24px] p-5 border border-white/20">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{title}</h3>
          <div className="flex justify-between items-end">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {days} Days • {places} Destination
            </div>
            <div className="text-right text-white">
              <div className="text-[10px] opacity-60 uppercase font-bold">From</div>
              <div className="text-xl font-black">{formatPricing(pricing, displayCurrency)}</div>
            </div>
          </div>
          <div className="h-px bg-white/10 my-3" />
          <div className="flex justify-between text-[11px] font-medium text-white/70">
            <span>{author}</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}