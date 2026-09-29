import type { Metadata } from "next";
import "./globals.css";
import "./expertises/expertises.css";

export const metadata: Metadata = {
  title: "INOX Technologies | Intégrateur de solutions informatiques",
  description:
    "Infrastructure, cloud, cybersécurité, développement et infogérance pour les organisations en Côte d’Ivoire.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
