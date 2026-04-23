import { RgbColorPicker } from "react-colorful";

function rgbToCss({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function normalizeRgb(next) {
  return {
    r: Math.round(Math.min(255, Math.max(0, next.r))),
    g: Math.round(Math.min(255, Math.max(0, next.g))),
    b: Math.round(Math.min(255, Math.max(0, next.b))),
  };
}

export default function BrushColorControls({ brushRgb, setBrushRgb }) {
  return (
    <div className="brush-color-controls">
      <span className="brush-color-heading">Brush color</span>
      <RgbColorPicker
        color={brushRgb}
        onChange={(next) => setBrushRgb(normalizeRgb(next))}
      />
      <div
        className="brush-color-swatch"
        style={{ backgroundColor: rgbToCss(brushRgb) }}
        title={`${rgbToCss(brushRgb)} — double-click to reset to black`}
        onDoubleClick={() => setBrushRgb({ r: 0, g: 0, b: 0 })}
        role="presentation"
      />
    </div>
  );
}
