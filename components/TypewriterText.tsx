"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  highlightWord: string;
  highlightClass: string;
  className?: string;
  speed?: number;
  delay?: number;
  isActive: boolean;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  highlightWord,
  highlightClass,
  className,
  speed = 60,
  delay = 0,
  isActive,
  onComplete,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsComplete(true);
          setIsTyping(false);
          
          // Hide cursor after a delay
          setTimeout(() => {
            setShowCursor(false);
            onComplete?.();
          }, 1000);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [isActive, text, speed, delay, onComplete]);

  // Cursor blink effect
  useEffect(() => {
    if (!isTyping && isComplete) return;
    
    const blinkInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(blinkInterval);
  }, [isTyping, isComplete]);

  // Replace highlight word with styled version
  const renderText = () => {
    if (!displayedText) return null;

    const parts = displayedText.split(new RegExp(`(${highlightWord})`, 'gi'));
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === highlightWord.toLowerCase()) {
        return (
          <span key={index} className={highlightClass}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <span className={cn("relative inline", className)}>
      {renderText()}
      {showCursor && (
        <span 
          className={cn(
            "inline-block w-[3px] h-[1em] ml-1 align-middle rounded-sm",
            isTyping ? "bg-slate-900" : "bg-slate-400",
            "animate-pulse"
          )}
          style={{ 
            verticalAlign: "text-bottom",
            marginBottom: "0.1em"
          }}
        />
      )}
    </span>
  );
}

// Alternative simpler version for single-line verdicts
interface SimpleTypewriterProps {
  children: React.ReactNode;
  isActive: boolean;
  speed?: number;
  delay?: number;
}

export function SimpleTypewriter({ 
  children, 
  isActive, 
  speed = 40,
  delay = 0 
}: SimpleTypewriterProps) {
  const [visible, setVisible] = useState(false);
  const [charCount, setCharCount] = useState(0);
  
  // Get text content from children
  const text = typeof children === 'string' 
    ? children 
    : (children as any)?.props?.children || '';

  useEffect(() => {
    if (!isActive) return;

    const startTimeout = setTimeout(() => {
      setVisible(true);
      let count = 0;
      
      const interval = setInterval(() => {
        count++;
        setCharCount(count);
        
        if (count >= 100) { // Arbitrary max
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [isActive, speed, delay]);

  if (!visible) return null;

  return (
    <span 
      className="typewriter-reveal"
      style={{
        clipPath: `inset(0 ${100 - charCount}% 0 0)`,
      }}
    >
      {children}
    </span>
  );
}
