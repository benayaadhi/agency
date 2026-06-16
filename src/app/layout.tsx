import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agency Tycoon — your AI marketing agency",
  description:
    "Play your marketing agency like a game. Send a brief, watch a specialist agent walk into their room and deliver.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
