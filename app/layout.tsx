import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Appbass · Bajo y contrabajo",
  description: "Jazz, blues, lecciones y práctica para bajo y contrabajo.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
