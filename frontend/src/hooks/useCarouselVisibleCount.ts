"use client";

import { useEffect, useState } from "react";

interface CarouselVisibleCountOptions {
  sm?: number;
  md?: number;
  lg: number;
}

export function useCarouselVisibleCount({ sm = 1, md = 2, lg }: CarouselVisibleCountOptions) {
  const [visibleCount, setVisibleCount] = useState(lg);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      if (width >= 1024) {
        setVisibleCount(lg);
        return;
      }

      if (width >= 768) {
        setVisibleCount(md);
        return;
      }

      if (width >= 640) {
        setVisibleCount(Math.min(sm + 1, md, lg));
        return;
      }

      setVisibleCount(sm);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [lg, md, sm]);

  return visibleCount;
}
