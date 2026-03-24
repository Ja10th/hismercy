"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const wordsArray = useMemo(() => words.split(" "), [words]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [delays, setDelays] = useState<number[]>([]);

  useLayoutEffect(() => {
    const calculateDelays = () => {
      const nodes = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
      if (!nodes.length) return;

      const lineMap = new Map<number, number>();
      const lineIndices: number[] = [];

      nodes.forEach((node, idx) => {
        const top = node.offsetTop;
        if (!lineMap.has(top)) {
          lineMap.set(top, lineMap.size);
        }
        lineIndices[idx] = lineMap.get(top) ?? 0;
      });

      const baseStagger = 0.045;
      const lineOverlap = 0.18;

      const nextDelays = lineIndices.map((lineIndex, wordIndex) =>
        Math.max(0, wordIndex * baseStagger - lineIndex * lineOverlap)
      );

      setDelays(nextDelays);
    };

    calculateDelays();

    const resizeObserver = new ResizeObserver(calculateDelays);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", calculateDelays);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateDelays);
    };
  }, [wordsArray]);

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="text-xl md:text-4xl leading-snug tracking-wide whitespace-normal text-black font-medium">
          <div ref={containerRef}>
            {wordsArray.map((word, idx) => (
              <motion.span
                key={`${word}-${idx}`}
                ref={(el) => {
                  wordRefs.current[idx] = el;
                }}
                className="inline"
                initial={{
                  opacity: 0,
                  filter: filter ? "blur(10px)" : "none",
                }}
                animate={{
                  opacity: 1,
                  filter: filter ? "blur(0px)" : "none",
                }}
                transition={{
                  duration,
                  delay: delays[idx] ?? idx * 0.04,
                  ease: "easeOut",
                }}
              >
                {word}
                {idx < wordsArray.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};