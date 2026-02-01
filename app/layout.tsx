import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TESE Admin Portal",
  description: "Production-grade admin portal for TESE video platform",
  keywords: ["admin", "portal", "video", "tese", "management"],
  authors: [{ name: "TESE Team" }],
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <SidebarProvider>
            <ToastProvider>{children}</ToastProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
