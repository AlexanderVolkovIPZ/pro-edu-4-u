import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthUserProvider } from "./providers/auth-user";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PRO-EDU-4-U",
  description: "PRO-EDU-4-U",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthUserProvider>
      <html lang="en">
        <body className={`${inter.className}`}>{children}</body>
      </html>
    </AuthUserProvider>
  );
}
