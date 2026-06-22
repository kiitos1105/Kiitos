import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminChrome } from "@/components/AdminChrome";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kiitos Work Room",
  description: "Online focus room display for YouTube Live and Discord."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          {children}
          <AdminChrome />
        </AuthProvider>
      </body>
    </html>
  );
}
