import type { ImageRatio } from "./SmartImage";

export type ImagePreset = {
  ratio: ImageRatio;
  sizes: string;
  variantWidths: number[];
  maxWidth: number;
  height?: number;
  fit: "cover" | "contain" | "smart";
};

const gridSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

export const IMAGE_PRESETS = {
  "card-square": { ratio: "1/1", sizes: gridSizes, variantWidths: [400, 640, 800, 1200], maxWidth: 1200, fit: "smart" },
  "card-standard": { ratio: "4/3", sizes: gridSizes, variantWidths: [400, 640, 800, 1200], maxWidth: 1200, fit: "smart" },
  "card-wide": { ratio: "16/9", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw", variantWidths: [640, 800, 1200, 1600], maxWidth: 1600, fit: "smart" },
  "card-short": { ratio: "21/9", sizes: "(max-width: 640px) 100vw, 50vw", variantWidths: [400, 640, 800], maxWidth: 800, height: 160, fit: "smart" },
  "card-tall": { ratio: "3/4", sizes: "(max-width: 640px) 75vw, 33vw", variantWidths: [400, 640, 800], maxWidth: 800, fit: "smart" },
  hero: { ratio: "auto", sizes: "100vw", variantWidths: [800, 1200, 1600, 2000], maxWidth: 2000, height: 440, fit: "cover" },
  thumb: { ratio: "1/1", sizes: "(max-width: 640px) 64px, 96px", variantWidths: [128, 192, 256], maxWidth: 256, height: 96, fit: "smart" }
} satisfies Record<string, ImagePreset>;

export const IMAGE_VARIANT_WIDTHS = [400, 640, 800, 1200, 1600] as const;

/**
 * CDN adapter contract. Configure this only when the project has a real image
 * transformation endpoint (Cloudinary, imgix, Supabase, etc.). Never append
 * guessed query parameters to local assets.
 */
export type ImageVariantAdapter = (src: string, width: number, focalPoint: { x: number; y: number }) => string;
