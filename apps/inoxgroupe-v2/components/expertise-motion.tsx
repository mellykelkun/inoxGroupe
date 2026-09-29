"use client";

import { useEffect } from "react";
import type { ExpertiseTheme } from "@/lib/expertise-data";

export function ExpertiseMotion({ theme }: { theme: ExpertiseTheme }) {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(`[data-expertise-page="${theme}"]`);
    if (!page) return;

    page.classList.add("expertise-motion-ready");
    const elements = Array.from(page.querySelectorAll<HTMLElement>("[data-x-reveal]"));
    const heroElements = elements.filter((element) => element.closest(".xp-hero"));
    const scrollElements = elements.filter((element) => !element.closest(".xp-hero"));
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

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const update = () => {
      page.style.setProperty("--expertise-scroll", `${window.scrollY}px`);
      frame = 0;
    };
    const onScroll = () => {
      if (!reducedMotion && !frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(heroFrame);
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      page.classList.remove("expertise-motion-ready");
    };
  }, [theme]);

  return (
    <div className={`expertise-transition expertise-transition--${theme}`} aria-hidden="true">
      {theme === "depth" ? <>{[0, 1, 2, 3, 4].map((item) => <i key={item} />)}</> : null}
      {theme === "radar" ? <><i /><i /><i /><span /></> : null}
      {theme === "matrix" ? <>{Array.from({ length: 12 }, (_, item) => <i key={item} />)}</> : null}
      {theme === "panels" ? <>{[0, 1, 2, 3].map((item) => <i key={item} />)}</> : null}
    </div>
  );
}
