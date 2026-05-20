"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

export default function AdminDeviceGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  if (!mounted) return null;

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <Monitor className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-semibold">
            Desktop Only
          </h1>

          <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-300">
            The admin dashboard is only available on larger screens.
            Please open this page on a laptop or desktop computer.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}