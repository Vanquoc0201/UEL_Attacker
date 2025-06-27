// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NovaLedger Dashboard", 
  description: "Advanced Financial Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Thêm màu nền cơ bản cho toàn bộ trang */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900`}>
        {/* Sử dụng Flexbox để đặt Sidebar và Main content cạnh nhau */}
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Main content sẽ chiếm toàn bộ không gian còn lại */}
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}