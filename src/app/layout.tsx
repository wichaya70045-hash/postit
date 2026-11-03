import type { Metadata, Viewport } from "next";
import { Mali, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const mali = Mali({
  weight: ["400", "600"],
  subsets: ["thai", "latin"],
  variable: "--font-thai-handwriting",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-thai-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yanin Board - กระดานโพสต์อิทออนไลน์",
  description: "พื้นที่เขียน วาด และลากโพสต์อิทมาแปะลงกระดานได้อย่างอิสระ ใช้งานได้ทั้งบนคอมพิวเตอร์และมือถือ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Yanin Board",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f0e6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${mali.variable} ${notoSansThai.variable}`}>
      <body className="antialiased min-h-[100dvh] flex flex-col font-sans select-none">
        {children}
      </body>
    </html>
  );
}
