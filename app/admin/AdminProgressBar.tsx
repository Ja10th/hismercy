"use client";

// Thin progress bar that appears at the top of the admin shell whenever a
// Next.js navigation is in-flight. Uses the native useRouter + startTransition
// approach — no extra libraries needed.

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function AdminProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRoute = useRef(`${pathname}${searchParams.toString()}`);

  // Advance the bar smoothly while loading
  function startProgress() {
    setWidth(0);
    setVisible(true);

    let current = 0;
    timerRef.current = setInterval(() => {
      // Ease toward 90% but never reach 100% until navigation completes
      current += (90 - current) * 0.12;
      setWidth(Math.min(current, 89));
    }, 80);
  }

  function finishProgress() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setWidth(100);
    // Brief pause at 100% then fade out
    setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 300);
  }

  useEffect(() => {
    const nextRoute = `${pathname}${searchParams.toString()}`;
    if (nextRoute !== prevRoute.current) {
      prevRoute.current = nextRoute;
      finishProgress();
    }
  }, [pathname, searchParams]);

  // Intercept link clicks to start the bar immediately on click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;

      // Only trigger for same-origin admin navigation
      const isSameOrigin =
        !href.startsWith("http") ||
        href.startsWith(window.location.origin);

      if (isSameOrigin) {
        startProgress();
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Also trigger on form submissions (e.g. search forms)
  useEffect(() => {
    function handleSubmit() {
      startProgress();
    }

    document.addEventListener("submit", handleSubmit);
    return () => document.removeEventListener("submit", handleSubmit);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[3px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-all duration-150 ease-out"
      style={{ width: `${width}%` }}
      aria-hidden
    />
  );
}
