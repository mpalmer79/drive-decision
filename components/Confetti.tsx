"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
  type: "circle" | "square" | "triangle" | "star";
}

const COLORS = [
  "rgb(16, 185, 129)",   // emerald
  "rgb(20, 184, 166)",   // teal
  "rgb(34, 211, 238)",   // cyan
  "rgb(245, 158, 11)",   // amber
  "rgb(249, 115, 22)",   // orange
  "rgb(139, 92, 246)",   // purple
  "rgb(236, 72, 153)",   // pink
  "rgb(255, 255, 255)",  // white
];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 10,
    rotation: Math.random() * 360,
    type: (["circle", "square", "triangle", "star"] as const)[Math.floor(Math.random() * 4)],
  }));
}

function ConfettiPieceComponent({ piece }: { piece: ConfettiPiece }) {
  const shapeStyles: Record<string, React.CSSProperties> = {
    circle: { borderRadius: "50%" },
    square: { borderRadius: "2px" },
    triangle: {
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderLeft: `${piece.size / 2}px solid transparent`,
      borderRight: `${piece.size / 2}px solid transparent`,
      borderBottom: `${piece.size}px solid ${piece.color}`,
    },
    star: { borderRadius: "2px", transform: `rotate(${piece.rotation}deg)` },
  };

  return (
    <div
      className="confetti-piece"
      style={{
        position: "absolute",
        left: `${piece.x}%`,
        top: "-20px",
        width: piece.type === "triangle" ? 0 : piece.size,
        height: piece.type === "triangle" ? 0 : piece.size,
        backgroundColor: piece.type === "triangle" ? "transparent" : piece.color,
        animationDelay: `${piece.delay}s`,
        animationDuration: `${piece.duration}s`,
        ...shapeStyles[piece.type],
      }}
    />
  );
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  pieceCount?: number;
}

export function Confetti({ active, duration = 4000, pieceCount = 100 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setPieces(generateConfetti(pieceCount));
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, pieceCount]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <ConfettiPieceComponent key={piece.id} piece={piece} />
      ))}
      
      <style jsx global>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) rotate(180deg) scale(1.1);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) rotate(360deg) scale(0.9);
            opacity: 0.8;
          }
          75% {
            transform: translateY(75vh) rotate(540deg) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes confettiSway {
          0%, 100% {
            margin-left: 0;
          }
          25% {
            margin-left: 30px;
          }
          75% {
            margin-left: -30px;
          }
        }
        
        .confetti-piece {
          animation: 
            confettiFall var(--duration, 3s) ease-out forwards,
            confettiSway 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Burst effect from center
export function ConfettiBurst({ active, duration = 3000 }: { active: boolean; duration?: number }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    angle: number;
    distance: number;
    color: string;
    size: number;
    delay: number;
  }>>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        angle: (i / 60) * 360 + Math.random() * 30,
        distance: 150 + Math.random() * 200,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 8,
        delay: Math.random() * 0.2,
      }));
      setParticles(newParticles);
      setVisible(true);

      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-burst"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              "--angle": `${p.angle}deg`,
              "--distance": `${p.distance}px`,
              animationDelay: `${p.delay}s`,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      <style jsx global>{`
        @keyframes burst {
          0% {
            transform: rotate(var(--angle)) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angle)) translateX(var(--distance)) scale(0);
            opacity: 0;
          }
        }
        
        .animate-burst {
          animation: burst 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
}
