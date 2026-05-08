"use client";

import { useState } from "react";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import styles from "./ImageSlider.module.css";

interface ImageSliderProps {
  images: string[];
  alt?: string;
}

const FALLBACK = "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?q=80&w=1170&auto=format&fit=crop";

export default function ImageSlider({ images, alt = "" }: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const slides = images.length > 0 ? images : [FALLBACK];

  function goTo(n: number) {
    setCurrent(((n % slides.length) + slides.length) % slides.length);
  }

  return (
    <div className={styles.root}>
      <div
        className={styles.track}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((src, i) => (
          <div key={i} className={styles.slide}>
            <Image
              src={src}
              alt={i === 0 ? alt : ""}
              fill
              style={{ objectFit: "cover" }}
              draggable={false}
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <button
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(current - 1); }}
            aria-label="Previous image"
          >
            <IconChevronLeft size={16} stroke={2} />
          </button>

          <button
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(current + 1); }}
            aria-label="Next image"
          >
            <IconChevronRight size={16} stroke={2} />
          </button>

          <div className={styles.dots}>
            {slides.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot}${i === current ? ` ${styles.dotActive}` : ""}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(i); }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
