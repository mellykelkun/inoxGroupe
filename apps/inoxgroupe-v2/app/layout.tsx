import type { Metadata } from "next";
import "./globals.css";
import "./expertises/expertises.css";
import { AssistantFlottant } from "@/components/assistant-flottant";

export const metadata: Metadata = {
  title: "Le fil INOX | Expertises, pratiques et retours d’expérience",
  description:
    "Le réseau éditorial d’INOX Technologies : expertises, pratiques et retours d’expérience pour les organisations en Côte d’Ivoire.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}<AssistantFlottant /></body>
    </html>
  );
}
