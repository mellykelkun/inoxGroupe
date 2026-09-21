import Image from "next/image";

export default function LogoInox({ precharger = false }) {
  return (
    <Image
      className="logoInox"
      src="/logos/logo-inox-technologies.png"
      width={417}
      height={295}
      alt=""
      preload={precharger}
    />
  );
}
