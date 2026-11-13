import type { MouseEvent } from "react";
import { SmartImage, type FocalPoint } from "./SmartImage";
import "./focal-point-editor.css";

type Props = { src: string; name: string; focalPoint?: FocalPoint; onChange: (point: FocalPoint) => void };

const formats = [
  { label: "Cuadrado", ratio: "1/1" as const },
  { label: "Estándar 4:3", ratio: "4/3" as const },
  { label: "Panorámico 16:9", ratio: "16/9" as const }
];

export default function FocalPointEditor({ src, name, focalPoint = {x:50,y:50}, onChange }: Props) {
  const choosePoint = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    onChange({
      x: Math.round(Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))),
      y: Math.round(Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100)))
    });
  };

  return <section className="focal-point-editor">
    <div className="focal-editor-heading"><div><b>Ajuste del punto focal</b><small>{name} · Hacé clic en la zona que querés priorizar</small></div><span>X: {Math.round(focalPoint.x)}% · Y: {Math.round(focalPoint.y)}%</span></div>
    <div className="focal-editor-previews">
      {formats.map(format => <div className="focal-editor-format" key={format.ratio}>
        <span>{format.label}</span>
        <div className="focal-editor-click-area" onClick={choosePoint} role="button" tabIndex={0} aria-label={`Elegir punto focal para formato ${format.label}`}>
          <SmartImage src={src} alt={name} ratio={format.ratio} focalPoint={focalPoint} fit="cover"/>
          <span className="focal-crosshair" style={{left:`${focalPoint.x}%`,top:`${focalPoint.y}%`}}/>
        </div>
      </div>)}
    </div>
  </section>;
}
