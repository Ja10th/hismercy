import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Mercy Agricultural Services",
  description: "Supplying maize, soya, wheat offal and branded feeds. Browse trusted feed brands, place orders, and get reliable delivery across Ekiti.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-white text-neutral-900 font-sans antialiased"
      >
        {children}
      </body>
    </html>
  );
}
