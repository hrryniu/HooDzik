import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "HooDzik - Zaawansowane Zarządzanie Zdrowiem",
  description: "Nowoczesna aplikacja do śledzenia zdrowia, diety i fitnessu z wizualizacją 3D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}


