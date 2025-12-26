import { useEffect, useRef, useState } from "react";

import Image from "next/image";

export interface VideoMeta {
  aspectRatio: number;
  placeholder: string;
  width?: number;
  height?: number;
}

export function VideoWithPlaceholder({
  src,
  controls = false,
  autoplay = true,
  muted = true,
  loop = true,
  playsInline = true,
  className,
  style,
  meta,
}: {
  src: string;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  meta: {
    aspectRatio: number;
    placeholder: string;
  };
}) {
  const aspectRatio = meta.aspectRatio ?? null;
  const placeholder = meta.placeholder ?? null;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // when visible – set src on <video> to avoid network before needed
  useEffect(() => {
    const v = videoRef.current;
    if (!visible || !v) return;
    // set attributes and try to play if requested
    v.src = src;
    v.preload = "metadata";
    v.playsInline = playsInline;
    v.muted = muted;
    v.loop = loop;
    v.oncanplay = () => setLoaded(true);

    if (autoplay) {
      v.play().catch(() => {
        // autoplay may be blocked – leave it paused but still loaded
      });
    }
  }, [visible, src, autoplay, muted, loop, playsInline]);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    ...(aspectRatio ? { aspectRatio: `${aspectRatio}` } : {}),
    ...(style || {}),
  };
  const paddingFallback: React.CSSProperties = aspectRatio
    ? { paddingTop: `${(1 / aspectRatio) * 100}%` }
    : {};

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      {placeholder && (
        <Image
          aria-hidden
          src={placeholder}
          alt=""
          width={videoRef.current?.videoWidth || 0}
          height={videoRef.current?.videoHeight || 0}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(24px)",
            transform: "scale(1.15)",
            transition: "opacity .25s",
            opacity: loaded ? 0 : 1,
            pointerEvents: "none",
          }}
        />
      )}

      {visible && (
        <video
          ref={videoRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "opacity .25s",
            opacity: loaded ? 1 : 0,
          }}
          poster={placeholder || undefined}
          controls={controls}
          muted={muted}
          playsInline={playsInline}
        />
      )}
    </div>
  );
}
