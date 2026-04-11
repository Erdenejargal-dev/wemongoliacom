"use client";

import { useEffect, useState } from "react";

const contributors = [
  "Mijid Munkhtulga",
  "Bilguunbaatar",
  "Bat-erdene",
  "Bachka Anbat",
   "Bilguun Alzakhguibaatar",
];

export default function GratitudePage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-screen w-full bg-white text-black flex items-center justify-center px-6">
      <div
        className={`max-w-2xl text-center transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Main message */}
        <p className="text-xl leading-relaxed font-light tracking-wide mb-10">
          This project was never built alone.
        </p>

        <p className="text-lg leading-relaxed font-light text-black/70 mb-12">
          It exists because of people who gave their time, their attention,
          and their belief — often quietly, without expecting anything in return.
        </p>

        {/* Names as part of flow */}
        <div className="text-base text-black/80 font-light tracking-wide leading-loose">
          {contributors.join(" · ")}
        </div>

        {/* Closing line */}
        <p className="mt-14 text-sm text-black/50 tracking-[0.2em] uppercase">
          Thank you
        </p>
      </div>
    </div>
  );
}