"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import type { EmblaOptionsType, EmblaCarouselType } from "embla-carousel";
import { cn } from "@/lib/utils";

export type CarouselApi = EmblaCarouselType | undefined;

interface CarouselContextValue {
  emblaApi: CarouselApi | undefined;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarouselContext() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("Carousel components must be used within <Carousel />");
  }
  return context;
}

interface CarouselProps {
  children: React.ReactNode;
  opts?: EmblaOptionsType;
  setApi?: (api: CarouselApi) => void;
  className?: string;
}

export function Carousel({
  children,
  opts,
  setApi,
  className,
}: CarouselProps) {
  const [viewportRef, emblaApi] = useEmblaCarousel(opts);

  React.useEffect(() => {
    if (!emblaApi || !setApi) return;
    setApi(emblaApi);
  }, [emblaApi, setApi]);

  return (
    <CarouselContext.Provider value={{ emblaApi }}>
      <div ref={viewportRef} className={cn("overflow-hidden", className)}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

interface CarouselContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CarouselContent({
  children,
  className,
}: CarouselContentProps) {
  useCarouselContext();

  return <div className={cn("flex", className)}>{children}</div>;
}

interface CarouselItemProps {
  children: React.ReactNode;
  className?: string;
}

export function CarouselItem({ children, className }: CarouselItemProps) {
  useCarouselContext();

  return (
    <div className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}>
      {children}
    </div>
  );
}