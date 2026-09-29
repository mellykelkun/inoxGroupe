"use client";

import { useEffect } from "react";

export function MotionLayer() {
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const heroElements = elements.filter((element) => element.closest(".hero"));
    const scrollElements = elements.filter((element) => !element.closest(".hero"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -2%" },
    );

    scrollElements.forEach((element) => observer.observe(element));
    const heroFrame = window.requestAnimationFrame(() => {
      heroElements.forEach((element) => element.classList.add("is-visible"));
    });

    let frame = 0;
    const updateScroll = () => {
      document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(heroFrame);
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="page-curtain" aria-hidden="true" />;
}
