import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";
import ReactQueryProvider from "@/lib/react-query-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pregnancy BP Tracker",
  description: "Track your blood pressure during pregnancy with ease and share data with healthcare providers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ReactQueryProvider>
            {children}
            <Toaster 
              position="top-right" 
              richColors 
              closeButton
              expand={true}
            />
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
