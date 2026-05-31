import React, { useRef, useEffect } from 'react';

const FadingVideo = ({ src, className, style = {} }) => {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const fadingOutRef = useRef(false);

  const FADE_MS = 500;
  const FADE_OUT_LEAD = 0.55; // seconds

  const fadeTo = (target, duration) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const video = videoRef.current;
    if (!video) return;

    const currentOpacityStr = video.style.opacity;
    const startOpacity = currentOpacityStr !== "" ? parseFloat(currentOpacityStr) : 0;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentOpacity = startOpacity + (target - startOpacity) * progress;
      video.style.opacity = currentOpacity.toString();

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  const handleLoadedData = () => {
    const video = videoRef.current;
    if (!video) return;
    video.style.opacity = "0";
    video.play().catch((err) => console.warn("Video auto-play blocked or failed:", err));
    fadingOutRef.current = false;
    fadeTo(1, FADE_MS);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const duration = video.duration;
    const currentTime = video.currentTime;

    if (
      duration &&
      !fadingOutRef.current &&
      duration - currentTime <= FADE_OUT_LEAD &&
      duration - currentTime > 0
    ) {
      fadingOutRef.current = true;
      fadeTo(0, FADE_MS);
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;
    video.style.opacity = "0";
    
    setTimeout(() => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      v.play().catch((err) => console.warn("Video loop play failed:", err));
      fadingOutRef.current = false;
      fadeTo(1, FADE_MS);
    }, 100);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (video.readyState >= 2) {
        handleLoadedData();
      }
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      style={{ ...style, opacity: 0 }}
      autoPlay
      muted
      playsInline
      preload="auto"
      onLoadedData={handleLoadedData}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    />
  );
};

export default FadingVideo;
