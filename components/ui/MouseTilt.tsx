// components/MouseTilt.tsx
"use client";

import { useState, useRef } from "react";

interface MouseTiltProps {
  children: React.ReactNode;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  easing?: string;
}

const MouseTilt: React.FC<MouseTiltProps> = ({
  children,
  maxTilt = 20,
  perspective = 1000,
  scale = 1,
  speed = 1500,
  easing = "cubic-bezier(.03,.98,.52,.99)",
}) => {
  const [transformStyle, setTransformStyle] = useState<string>("none");
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

   
    const halfW = innerWidth / 2;
    const halfH = innerHeight / 2;
    const dx = clientX - halfW;
    const dy = clientY - halfH;

   
    const tiltX = (dy / halfH) * maxTilt;
    const tiltY = -(dx / halfW) * maxTilt;

    setTransformStyle(
      `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`
    );
  };

  const handleMouseLeave = () => {
    setTransformStyle("none");
  };

  const componentStyle = {
    transition: `transform ${speed}ms ${easing}`,
    transform: transformStyle,
    willChange: "transform",
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={componentStyle}
    >
      {children}
    </div>
  );
};

export default MouseTilt;