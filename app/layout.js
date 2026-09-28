import "./globals.css";
import localFont from "next/font/local";
import ApplicationInox from "../composants/ApplicationInox";
import ContactFlottant from "../composants/ContactFlottant";

const perfograma = localFont({
  src: "./fonts/Perfograma.otf",
  variable: "--font-perfograma",
  weight: "400",
  display: "swap",
  fallback: ["monospace"],
});

export const metadata = {
  applicationName: "INOX Technologies",
  title: "INOX Technologies | Solutions informatiques & cybersécurité",
  description:
    "INOX Technologies sécurise, connecte et modernise l’informatique des entreprises pour améliorer la continuité, la productivité et la performance.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "INOX Technologies",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/inox-app-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/inox-app-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/inox-app-180.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edf6fc" },
    { media: "(prefers-color-scheme: dark)", color: "#082e55" },
  ],
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={perfograma.variable} data-scroll-behavior="smooth">
      <body>
        {children}
        <ApplicationInox />
        <ContactFlottant />
      </body>
    </html>
  );
}
