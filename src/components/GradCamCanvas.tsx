import React, { useRef, useEffect } from 'react';

interface GradCamCanvasProps {
  imageSrc: string;
  hotspots: Array<{
    x: number; // 0 to 100 percentage
    y: number; // 0 to 100 percentage
    radius: number; // 5 to 35 percentage
    intensity: number; // 0 to 1
  }>;
  opacity: number; // 0 to 1
  colormap: 'jet' | 'turbo' | 'inferno' | 'hot';
  showCrosshairs?: boolean;
}

export const GradCamCanvas: React.FC<GradCamCanvasProps> = ({
  imageSrc,
  hotspots,
  opacity,
  colormap,
  showCrosshairs = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      // Set canvas coordinate space
      const width = img.naturalWidth || 600;
      const height = img.naturalHeight || 600;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw base radiograph
      ctx.drawImage(img, 0, 0, width, height);

      // If opacity is 0 or no hotspots, stop here
      if (opacity <= 0 || !hotspots || hotspots.length === 0) return;

      // 2. Create offscreen canvas for activation intensity map
      const heatCanvas = document.createElement('canvas');
      heatCanvas.width = width;
      heatCanvas.height = height;
      const heatCtx = heatCanvas.getContext('2d');
      if (!heatCtx) return;

      // Draw radial gradients for each hotspot
      hotspots.forEach((spot) => {
        const cx = (spot.x / 100) * width;
        const cy = (spot.y / 100) * height;
        const r = (spot.radius / 100) * Math.min(width, height);

        const radGrad = heatCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const alpha = Math.min(1.0, Math.max(0.1, spot.intensity));
        radGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        radGrad.addColorStop(0.35, `rgba(200, 200, 200, ${alpha * 0.75})`);
        radGrad.addColorStop(0.7, `rgba(100, 100, 100, ${alpha * 0.35})`);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        heatCtx.fillStyle = radGrad;
        heatCtx.beginPath();
        heatCtx.arc(cx, cy, r, 0, Math.PI * 2);
        heatCtx.fill();
      });

      // 3. Colorize the grayscale activation map using selected colormap
      const heatImgData = heatCtx.getImageData(0, 0, width, height);
      const pixels = heatImgData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        // Use red channel as luminance scalar (0 to 255)
        const v = pixels[i] / 255;
        if (v > 0.04) {
          const rgb = getColormapRgb(v, colormap);
          pixels[i] = rgb.r;
          pixels[i + 1] = rgb.g;
          pixels[i + 2] = rgb.b;
          pixels[i + 3] = Math.round(v * opacity * 255);
        } else {
          pixels[i + 3] = 0;
        }
      }

      heatCtx.putImageData(heatImgData, 0, 0);

      // 4. Blend colormapped activation over radiograph
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(heatCanvas, 0, 0);
      ctx.restore();

      // 5. Draw subtle medical crosshairs & region boxes if requested
      if (showCrosshairs && opacity > 0.15) {
        hotspots.forEach((spot, idx) => {
          const cx = (spot.x / 100) * width;
          const cy = (spot.y / 100) * height;
          const r = (spot.radius / 100) * Math.min(width, height);

          ctx.save();
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
          ctx.lineWidth = Math.max(1.5, width / 400);
          ctx.setLineDash([4, 4]);

          // Bounding circle
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
          ctx.stroke();

          // Crosshair lines
          ctx.setLineDash([]);
          const lineLen = r * 0.3;
          ctx.beginPath();
          ctx.moveTo(cx - lineLen, cy);
          ctx.lineTo(cx + lineLen, cy);
          ctx.moveTo(cx, cy - lineLen);
          ctx.lineTo(cx, cy + lineLen);
          ctx.stroke();

          // ROI label
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          const label = `ROI #${idx + 1} (${Math.round(spot.intensity * 100)}%)`;
          ctx.font = `600 ${Math.max(11, Math.round(width / 45))}px monospace`;
          const textMetrics = ctx.measureText(label);
          ctx.fillRect(cx - textMetrics.width / 2 - 4, cy - r * 0.95 - 18, textMetrics.width + 8, 20);

          ctx.fillStyle = '#22d3ee';
          ctx.fillText(label, cx - textMetrics.width / 2, cy - r * 0.95 - 4);

          ctx.restore();
        });
      }
    };
  }, [imageSrc, hotspots, opacity, colormap, showCrosshairs]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-black">
      <canvas
        ref={canvasRef}
        className="max-h-[500px] w-auto max-w-full object-contain cursor-crosshair rounded-lg"
      />
    </div>
  );
};

// Color mapping formulas
function getColormapRgb(
  val: number,
  map: 'jet' | 'turbo' | 'inferno' | 'hot'
): { r: number; g: number; b: number } {
  const v = Math.min(1.0, Math.max(0, val));

  if (map === 'inferno') {
    // Smooth black -> purple -> red -> yellow -> white
    const r = Math.min(255, Math.round(255 * (1.3 * v)));
    const g = Math.min(255, Math.round(255 * Math.pow(v, 2.2) * 1.5));
    const b = Math.min(255, Math.round(255 * Math.sin(v * Math.PI * 0.9)));
    return { r, g, b };
  } else if (map === 'hot') {
    // Black -> Red -> Orange -> Yellow -> White
    const r = Math.min(255, Math.round((v / 0.35) * 255));
    const g = v < 0.35 ? 0 : Math.min(255, Math.round(((v - 0.35) / 0.4) * 255));
    const b = v < 0.75 ? 0 : Math.min(255, Math.round(((v - 0.75) / 0.25) * 255));
    return { r, g, b };
  } else if (map === 'turbo') {
    // Google Turbo approximation
    const r = Math.round(255 * Math.sin(v * 1.57));
    const g = Math.round(255 * Math.sin(v * Math.PI));
    const b = Math.round(255 * Math.cos(v * 1.57));
    return { r, g, b };
  } else {
    // Standard Jet colormap: Blue -> Cyan -> Yellow -> Red
    let r = 0;
    let g = 0;
    let b = 0;
    if (v < 0.25) {
      b = 255;
      g = Math.round(255 * (v / 0.25));
    } else if (v < 0.5) {
      g = 255;
      b = Math.round(255 * (1 - (v - 0.25) / 0.25));
    } else if (v < 0.75) {
      g = 255;
      r = Math.round(255 * ((v - 0.5) / 0.25));
    } else {
      r = 255;
      g = Math.round(255 * (1 - (v - 0.75) / 0.25));
    }
    return { r, g, b };
  }
}
