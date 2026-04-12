import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SplashScreen } from "@/components/ui/SplashScreen";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PawMigos - Care Worth Wagging About",
  description: "Trust-first pet services marketplace. Find verified pet boarders, sitters, walkers, groomers, and trainers.",
  icons: { icon: "/images/app-icon.png", apple: "/images/app-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F26F28",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist)] relative">
        <div className="fixed inset-0 -z-50 overflow-hidden bg-[#FAF3E3]">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#F26F28]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[40%] right-[-20%] w-[60vw] h-[60vw] bg-[#F26F28]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute bottom-[-10%] left-[10%] w-[40vw] h-[40vw] bg-[#F26F28]/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        </div>
        
        <SplashScreen />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
