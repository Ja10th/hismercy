"use client";

import { useEffect } from "react";

export default function PrintReceiptClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}