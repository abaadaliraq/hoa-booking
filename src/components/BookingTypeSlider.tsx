"use client";

import { useEffect, useRef } from "react";
import { bookingTypeOrder } from "@/data/bookingContent";
import type { BookingContent, BookingType } from "@/types/booking";

type Props = {
  content: BookingContent;
  selected: BookingType;
  onSelect: (type: BookingType) => void;
  onSoon: () => void;
};

export default function BookingTypeSlider({
  content,
  selected,
  onSelect,
  onSoon,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pauseFramesRef = useRef(0);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const pressedTypeRef = useRef<BookingType | null>(null);
  const movedRef = useRef(false);
  const loopItems = [...bookingTypeOrder, ...bookingTypeOrder];

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const node = scrollRef.current;
      if (pauseFramesRef.current > 0) {
        pauseFramesRef.current -= 1;
      } else if (node && !draggingRef.current) {
        const loopPoint = node.scrollWidth / 2;
        node.scrollLeft += 0.72;
        if (node.scrollLeft >= loopPoint) {
          node.scrollLeft -= loopPoint;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function pause() {
    pauseFramesRef.current = 110;
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!scrollRef.current) return;
    const target = event.target as HTMLElement;
    const card = target.closest<HTMLButtonElement>("[data-booking-type]");

    pause();
    draggingRef.current = true;
    movedRef.current = false;
    pressedTypeRef.current = (card?.dataset.bookingType as BookingType) || null;
    startXRef.current = event.clientX;
    startScrollRef.current = scrollRef.current.scrollLeft;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || !scrollRef.current) return;
    const delta = event.clientX - startXRef.current;
    if (Math.abs(delta) > 6) movedRef.current = true;
    scrollRef.current.scrollLeft = startScrollRef.current - delta;
  }

  function onPointerEnd() {
    draggingRef.current = false;
    if (!movedRef.current && pressedTypeRef.current) {
      const type = pressedTypeRef.current;
      const item = content.types[type];
      if (item.comingSoon) {
        onSoon();
      } else {
        window.setTimeout(() => onSelect(type), 140);
      }
    }
    pressedTypeRef.current = null;
    pause();
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerLeave={onPointerEnd}
      onMouseEnter={pause}
      onTouchStart={pause}
      className="-mx-5 cursor-grab touch-pan-x overflow-x-auto px-5 pb-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      dir="ltr"
    >
      <div className="flex w-max gap-3">
        {loopItems.map((type, index) => {
          const item = content.types[type];
          const active = selected === type;
          const key = `${type}-${index}`;

          return (
            <button
              key={key}
              type="button"
              data-booking-type={type}
              onClick={(event) => event.preventDefault()}
              className={`group relative h-[124px] w-[96px] shrink-0 overflow-hidden rounded-2xl border text-start shadow-lg shadow-black/20 transition duration-300 active:scale-95 animate-[cardIn_360ms_ease-out_both] ${
                active
                  ? "border-[#d8a45f] opacity-100"
                  : "border-white/10 opacity-80"
              }`}
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(180deg,rgba(18,13,10,0.05),rgba(18,13,10,0.9)), url('${item.image}')`,
                }}
              />
              {item.comingSoon && (
                <span className="absolute left-2 top-2 rounded-full bg-[#120d0a]/80 px-2 py-1 text-[9px] text-[#f1c982]">
                  {content.soon}
                </span>
              )}
              <span className="absolute inset-x-2 bottom-2 text-xs font-medium leading-4 text-white">
                {item.shortTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
