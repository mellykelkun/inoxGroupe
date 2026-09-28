export default function manifest() {
  return {
    id: "/",
    name: "INOX Technologies",
    short_name: "INOX",
    description: "L’expertise INOX Technologies, toujours à portée de main.",
    start_url: "/?source=application",
    scope: "/",
    lang: "fr",
    dir: "ltr",
    display: "standalone",
    background_color: "#edf6fc",
    theme_color: "#082e55",
    categories: ["business", "productivity", "technology"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/inox-app-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/inox-app-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/inox-app-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/inox-app-1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Découvrir nos expertises",
        short_name: "Expertises",
        description: "Accéder directement aux expertises INOX.",
        url: "/#solutions",
        icons: [{ src: "/icons/inox-app-192.png", sizes: "192x192" }],
      },
      {
        name: "Présenter votre projet",
        short_name: "Contact",
        description: "Échanger avec un expert INOX.",
        url: "/#contact",
        icons: [{ src: "/icons/inox-app-192.png", sizes: "192x192" }],
      },
    ],
  };
}
