// components/Preloader.tsx
"use client";

import { useState, useEffect } from 'react';

type PreloaderProps = {
  finishLoading: boolean;
  delay?: number;
  fadeDuration?: number;
  /** The primary color of the spinner. */
  color1?: string;
  /** The secondary/background color of the spinner. */
  color2?: string;
};

const Preloader: React.FC<PreloaderProps> = ({
  finishLoading,
  delay = 500,
  fadeDuration = 200,
  color1 = '#000',
  color2 = '#ccc',
}) => {
  const [isMounted, setIsMounted] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    document.body.classList.add('preloader-active');
    return () => {
      document.body.classList.remove('preloader-active');
    };
  }, []);

  useEffect(() => {
    if (finishLoading) {
      const fadeTimeout = setTimeout(() => {
        setIsFading(true);
        document.body.classList.remove('preloader-active');
      }, delay);

      const unmountTimeout = setTimeout(() => {
        setIsMounted(false);
      }, delay + fadeDuration);

      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(unmountTimeout);
      };
    }
  }, [finishLoading, delay, fadeDuration]);

  if (!isMounted) {
    return null;
  }

  const preloaderStyle = {
    '--color': color1,
    '--color2': color2,
    opacity: isFading ? 0 : 1,
    pointerEvents: isFading ? 'none' : 'auto',
    transition: `all ${fadeDuration / 1000}s linear`,
  } as React.CSSProperties;

  return (
    <>
      <style jsx>{`
        @keyframes cssload-rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        
        .wcf-preloader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999999;
          transition: all .2s linear;
          background: #fff;
        }
        
        .wcf-preloader.preloader-whirlpool .whirlpool {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 1px solid var(--color2, #ccc);
          border-left-color: var(--color, #000);
          border-radius: 974px;
          margin: -24px 0 0 -24px;
          height: 49px;
          width: 49px;
          animation: cssload-rotate 1.15s linear infinite;
        }
        
        .wcf-preloader.preloader-whirlpool .whirlpool::after,
        .wcf-preloader.preloader-whirlpool .whirlpool::before {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 1px solid var(--color2, #ccc);
          border-left-color: var(--color, #000);
          border-radius: 974px;
        }
        
        .wcf-preloader.preloader-whirlpool .whirlpool::before {
          content: "";
          margin: -22px 0 0 -22px;
          height: 43px;
          width: 43px;
          animation: cssload-rotate 1.15s linear infinite;
        }
        
        .wcf-preloader.preloader-whirlpool .whirlpool::after {
          content: "";
          margin: -28px 0 0 -28px;
          height: 55px;
          width: 55px;
          animation: cssload-rotate 2.3s linear infinite;
        }
      `}</style>
      
      <div
        className="wcf-preloader preloader-whirlpool"
        style={preloaderStyle}
      >
        <div className="whirlpool"></div>
      </div>
    </>
  );
};

export default Preloader;