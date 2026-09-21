import "./globals.css";

export const metadata = {
  title: "INOX Technologies | Ingénierie informatique & intégration",
  description:
    "INOX Technologies conçoit, intègre et accompagne les solutions numériques qui font évoluer votre système d’information.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
