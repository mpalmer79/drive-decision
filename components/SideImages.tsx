// components/SideImages.tsx
"use client";

import { useEffect, useState } from "react";

interface SideImagesProps {
  leftImage?: string;
  rightImage?: string;
}

export function SideImages({ 
  leftImage = "/side-left.jpg",
  rightImage = "/side-right.jpg"
}: SideImagesProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax effect - images move slower than scroll
  const parallaxOffset = scrollY * 0.3;

  return (
    <>
      {/* Left Side Image */}
      <div className="fixed left-0 top-0 w-[280px] xl:w-[350px] 2xl:w-[420px] h-screen overflow-hidden pointer-events-none hidden lg:block z-0">
        <div 
          className="absolute inset-0 w-full"
          style={{ 
            transform: `translateY(-${parallaxOffset}px)`,
            height: '150%',
            top: '-25%'
          }}
        >
          <img
            src={leftImage}
            alt="Chevrolet Showroom"
            className="w-full h-full object-cover opacity-60"
          />
          {/* Gradient overlay for smooth blend - light theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-300/95" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-300/30 via-transparent to-slate-300/30" />
        </div>
      </div>

      {/* Right Side Image */}
      <div className="fixed right-0 top-0 w-[280px] xl:w-[350px] 2xl:w-[420px] h-screen overflow-hidden pointer-events-none hidden lg:block z-0">
        <div 
          className="absolute inset-0 w-full"
          style={{ 
            transform: `translateY(-${parallaxOffset}px)`,
            height: '150%',
            top: '-25%'
          }}
        >
          <img
            src={rightImage}
            alt="Vehicle Shopping Experience"
            className="w-full h-full object-cover opacity-60"
          />
          {/* Gradient overlay for smooth blend - light theme */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-300/95" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-300/30 via-transparent to-slate-300/30" />
        </div>
      </div>
    </>
  );
}
