"use client";
import React, { useEffect, useRef, useState } from "react";

interface MouseTrackerProps {
  enabled?: boolean;
  showFollower?: boolean;
  cursorSize?: number;
  followerSize?: number;
  cursorColor?: string;
  followerColor?: string;
  animationDuration?: number;
  animationEase?: string;
  hoverScale?: number;
  hoverElements?: string;
  minWidth?: number;
}

export const MouseTracker: React.FC<MouseTrackerProps> = ({
  enabled = true,
  showFollower = true,
  cursorSize = 8,
  followerSize = 40,
  cursorColor = "#000",
  followerColor = "rgba(0, 0, 0, 0.1)",
  animationDuration = 0.6,
  animationEase = "cubic-bezier(0.23, 1, 0.32, 1)",
  hoverScale = 1.5,
  hoverElements = "a, button, [data-hover]",
  minWidth = 768,
}) => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);

  const [isClient, setIsClient] = useState(false);
  const [enabledState, setEnabledState] = useState(enabled);

  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const followerPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      setEnabledState(window.innerWidth >= minWidth && enabled);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isClient, enabled, minWidth]);

  useEffect(() => {
    if (!enabledState || !isClient) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const animate = () => {
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.2;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.2;

      followerPos.current.x += (mousePos.current.x - followerPos.current.x) * 0.1;
      followerPos.current.y += (mousePos.current.y - followerPos.current.y) * 0.1;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`;
      }

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0) scale(${followerRef.current.dataset.scale || 1})`;
      }

      requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [enabledState, isClient]);

  // Hover scaling effect
  useEffect(() => {
    if (!enabledState || !isClient || !hoverElements) return;

    const elements = document.querySelectorAll(hoverElements);

    const handleEnter = () => {
      if (followerRef.current) {
        followerRef.current.dataset.scale = hoverScale.toString();
      }
    };

    const handleLeave = () => {
      if (followerRef.current) {
        followerRef.current.dataset.scale = "1";
      }
    };

    elements.forEach((el) => {
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, [enabledState, isClient, hoverElements, hoverScale]);

  if (!isClient || !enabledState) return null;

  return (
    <>
     {/* Cursor dot */}
        <div
        ref={cursorRef}
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: `${cursorSize}px`,
            height: `${cursorSize}px`,
            backgroundColor: cursorColor,   // solid dot
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 9999,
            transition: `all ${animationDuration}s ${animationEase}`,
        }}
        />

        {/* Cursor ring follower */}
        {showFollower && (
        <div
            ref={followerRef}
            data-scale="1"
            style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: `${followerSize}px`,
            height: `${followerSize}px`,
            border: `2px solid ${followerColor}`, // ring effect
            backgroundColor: "transparent",       // hollow
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 9998,
            transition: `transform ${animationDuration}s ${animationEase}`,
            }}
        />
        )}

    </>
  );
};


// -------------------- Hover Text Cursor Hook --------------------
interface UseHoverTextCursorOptions {
  text?: string;
  enabled?: boolean;
  fontSize?: string;
  textColor?: string;
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
}
export const useHoverTextCursor = ({
  text = "View",
  enabled = true,
  fontSize = "14px",
  textColor = "#fff", 
  backgroundColor = "rgba(0, 0, 0, 0.8)",
  padding = "8px 12px",
  borderRadius = "20px",
}: UseHoverTextCursorOptions) => {
  const hoverCursorRef = useRef<HTMLDivElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const hoverCursor = hoverCursorRef.current;
    if (!hoverCursor) return;

    let mousePos = { x: 0, y: 0 };
    let animationId: number;

    const updatePosition = () => {
      if (hoverCursor && isHovering) {
        hoverCursor.style.left = `${mousePos.x}px`;
        hoverCursor.style.top = `${mousePos.y}px`;
      }
      animationId = requestAnimationFrame(updatePosition);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: e.clientY };
    };

    document.addEventListener("mousemove", handleMouseMove);
    updatePosition();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [enabled, isHovering]);

  const showHoverCursor = () => setIsHovering(true);
  const hideHoverCursor = () => setIsHovering(false);

  const HoverTextCursor: React.FC = () => (
    <div
      ref={hoverCursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        transform: "translate(-50%, -50%)",
        backgroundColor,
        color: textColor,
        fontSize,
        padding,
        borderRadius,
        pointerEvents: "none",
        zIndex: 10000,
        opacity: isHovering ? 1 : 0,
        scale: isHovering ? 1 : 0,
        transition: "all 0.3s ease",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );

  return {
    HoverTextCursor,
    showHoverCursor,
    hideHoverCursor,
    isHovering,
  };
};
