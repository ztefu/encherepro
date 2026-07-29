import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enchère Pro | Ventes aux enchères privées d'exception",
  description: "Plateforme numérique de ventes aux enchères privées en ligne. Découvrez nos lots exclusifs et réservez votre place.",
};

import { AdminProvider } from "@/context/AdminContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
        <AdminProvider>
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}
