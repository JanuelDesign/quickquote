import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollStripProps {
  children: React.ReactNode;
  className?: string;
  scrollStep?: number;
  depsKey?: string | number;
}

export const HorizontalScrollStrip: React.FC<HorizontalScrollStripProps> = ({
  children,
  className = '',
  scrollStep = 240,
  depsKey
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });
    resizeObserver.observe(el);

    const rafId = requestAnimationFrame(updateScrollState);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [updateScrollState, depsKey]);

  const scrollByDirection = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = direction === 'left' ? -scrollStep : scrollStep;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const hasOverflow = canScrollLeft || canScrollRight;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {hasOverflow && (
        <button
          type="button"
          onClick={() => scrollByDirection('left')}
          disabled={!canScrollLeft}
          aria-label="Desplazar colores a la izquierda"
          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
            canScrollLeft
              ? 'border-[#E4E2DA] bg-[#FAFAFA] hover:bg-[#181818] hover:text-white hover:border-[#181818] text-[#181818] cursor-pointer shadow-2xs'
              : 'border-[#F2F1EC] bg-[#FAFAFA] text-[#C8C6BE] cursor-default opacity-60'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className={`pill-scroll-row flex-1 min-w-0 ${className}`}
      >
        {children}
      </div>

      {hasOverflow && (
        <button
          type="button"
          onClick={() => scrollByDirection('right')}
          disabled={!canScrollRight}
          aria-label="Desplazar colores a la derecha"
          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
            canScrollRight
              ? 'border-[#E4E2DA] bg-[#FAFAFA] hover:bg-[#181818] hover:text-white hover:border-[#181818] text-[#181818] cursor-pointer shadow-2xs'
              : 'border-[#F2F1EC] bg-[#FAFAFA] text-[#C8C6BE] cursor-default opacity-60'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
