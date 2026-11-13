import { useEffect, useMemo, useState } from "react";
import { ImageOff } from "lucide-react";
import "./smart-image.css";

export type FocalPoint = { x: number; y: number };
export type SafeArea = { x: number; y: number; w: number; h: number };
export type ImageRatio = "4/3" | "16/9" | "1/1" | "3/4" | "21/9" | "auto";
export type ImageFit = "cover" | "contain" | "smart";

export type SmartImageProps = {
  src: string;
  alt: string;
  ratio?: ImageRatio;
  focalPoint?: FocalPoint;
  safeArea?: SafeArea;
  fit?: ImageFit;
  sizes?: string;
  srcSet?: string;
  priority?: boolean;
  rounded?: boolean | number;
  className?: string;
  preset?: keyof typeof import("./imagePresets").IMAGE_PRESETS;
  onClick?: () => void;
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

function smartNeedsContain(safeArea: SafeArea | undefined, imageRatio: number, boxRatio: number) {
  if (!safeArea || !imageRatio || !boxRatio) return false;
  let visibleX = 1;
  let visibleY = 1;
  if (imageRatio > boxRatio) visibleX = boxRatio / imageRatio;
  else visibleY = imageRatio / boxRatio;
  const cropX = (1 - visibleX) / 2;
  const cropY = (1 - visibleY) / 2;
  const left = safeArea.x / 100;
  const top = safeArea.y / 100;
  const right = left + safeArea.w / 100;
  const bottom = top + safeArea.h / 100;
  const visibleLeft = cropX;
  const visibleTop = cropY;
  const visibleRight = 1 - cropX;
  const visibleBottom = 1 - cropY;
  const intersectionW = Math.max(0, Math.min(right, visibleRight) - Math.max(left, visibleLeft));
  const intersectionH = Math.max(0, Math.min(bottom, visibleBottom) - Math.max(top, visibleTop));
  const originalArea = Math.max(0.0001, (right - left) * (bottom - top));
  return 1 - (intersectionW * intersectionH) / originalArea > 0.1;
}

export function SmartImage({
  src, alt, ratio = "4/3", focalPoint = { x: 50, y: 50 }, safeArea,
  fit = "smart", sizes, srcSet, priority = false, rounded = true, className = "",
  preset, onClick
}: SmartImageProps) {
  const presetConfig = preset ? (awaitlessPreset(preset)) : undefined;
  const resolvedRatio = ratio === "auto" ? (presetConfig?.ratio ?? "auto") : ratio;
  const resolvedSizes = sizes ?? presetConfig?.sizes ?? "100vw";
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const focal = { x: clamp(focalPoint.x), y: clamp(focalPoint.y) };
  const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });
  const wrapperRef = useMemo(() => ({ current: null as HTMLDivElement | null }), []);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect) setBoxSize({ width: rect.width, height: rect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [wrapperRef]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    setNaturalSize({ width: 0, height: 0 });
  }, [src]);

  useEffect(() => {
    if (naturalSize.width > 0 && naturalSize.width < 800) {
      console.warn(`MundoGlobal Travel: imagen de baja resolución (${naturalSize.width}px): ${src}`);
    }
  }, [naturalSize.width, src]);

  const shouldContain = fit === "contain" || (fit === "smart" && smartNeedsContain(
    safeArea,
    naturalSize.width / Math.max(1, naturalSize.height),
    boxSize.width / Math.max(1, boxSize.height)
  ));
  const ratioStyle = resolvedRatio === "auto" ? undefined : { aspectRatio: resolvedRatio.replace("/", " / ") };
  const roundedStyle = typeof rounded === "number" ? { borderRadius: rounded } : rounded ? undefined : { borderRadius: 0 };
  const canUseSrcSet = Boolean(srcSet);

  return <div
    ref={node => { wrapperRef.current = node; }}
    className={`smart-image ${loaded ? "is-loaded" : ""} ${failed ? "has-failed" : ""} ${shouldContain ? "uses-contain" : ""} ${className}`}
    style={{ ...ratioStyle, ...roundedStyle, ["--smart-focal-x" as string]: `${focal.x}%`, ["--smart-focal-y" as string]: `${focal.y}%` }}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    {!loaded && !failed && <span className="smart-image-skeleton" aria-hidden="true"/>}
    {shouldContain && !failed && <img className="smart-image-backdrop" src={src} alt="" aria-hidden="true" loading={priority ? "eager" : "lazy"} decoding="async"/>}
    {failed ? <span className="smart-image-fallback" role="img" aria-label={alt || "Imagen no disponible"}><ImageOff size={24}/><small>Imagen no disponible</small></span> :
      <img
        className="smart-image-main"
        src={src}
        srcSet={canUseSrcSet ? srcSet : undefined}
        sizes={resolvedSizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={event => {
          setNaturalSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight });
          setLoaded(true);
        }}
        onError={() => { setFailed(true); setLoaded(true); }}
      />}
  </div>;
}

function awaitlessPreset(name: keyof typeof import("./imagePresets").IMAGE_PRESETS) {
  // Kept as a small local fallback so SmartImage has no runtime dependency on a loader.
  const presets: Record<string, { ratio: ImageRatio; sizes: string }> = {
    "card-square": { ratio: "1/1", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" },
    "card-standard": { ratio: "4/3", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" },
    "card-wide": { ratio: "16/9", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" },
    "card-short": { ratio: "21/9", sizes: "(max-width: 640px) 100vw, 50vw" },
    "card-tall": { ratio: "3/4", sizes: "(max-width: 640px) 75vw, 33vw" },
    hero: { ratio: "auto", sizes: "100vw" },
    thumb: { ratio: "1/1", sizes: "96px" }
  };
  return presets[name];
}
