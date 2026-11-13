import { SmartImage } from "./SmartImage";
import "./image-lab.css";

const samples = [
  { name: "Cancún", src: "/images/cancun.jpg", focalPoint: { x: 52, y: 48 }, safeArea: { x: 18, y: 34, w: 64, h: 28 } },
  { name: "Salvador de Bahía", src: "/images/salvador.jpg", focalPoint: { x: 50, y: 50 } },
  { name: "Roma", src: "/images/roma.jpg", focalPoint: { x: 54, y: 48 } }
];
const presets = ["card-square", "card-standard", "card-wide", "card-short", "card-tall", "hero", "thumb"] as const;
const widths = [360, 768, 1280, 1920];

export default function ImageLab() {
  return <main className="image-lab">
    <header><span>DEV TOOL · MUNDO GLOBAL TRAVEL</span><h1>SmartImage · Image Lab</h1><p>La misma imagen evaluada en todos los presets y anchos de referencia.</p></header>
    {widths.map(width => <section className="image-lab-width" key={width}>
      <h2>Viewport de referencia: {width}px</h2>
      <div className="image-lab-grid" style={{ maxWidth: width }}>
        {samples.map(sample => <article className="image-lab-sample" key={sample.name}>
          <h3>{sample.name}</h3>
          <div className="image-lab-presets">
            {presets.map(preset => <div className="image-lab-item" key={preset}>
              <span>{preset}</span>
              <SmartImage src={sample.src} alt={sample.name} preset={preset} ratio="auto" focalPoint={sample.focalPoint} safeArea={sample.safeArea} priority={preset === "hero"}/>
            </div>)}
          </div>
        </article>)}
      </div>
    </section>)}
    <p className="image-lab-note">La pestaña Network del navegador permite comprobar bytes y variantes. Las imágenes locales actuales no tienen todavía un CDN/srcset real configurado.</p>
  </main>;
}
