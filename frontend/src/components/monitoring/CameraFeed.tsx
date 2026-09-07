import { Video, Maximize2, Volume2 } from 'lucide-react';
import type { ApiBoundingBox } from '@/types/api';

interface CameraFeedProps {
  /** Live detections from the inference stream; normalized 0-1 coordinates. */
  boxes?: ApiBoundingBox[];
  connected?: boolean;
}

/** Detector class -> the label shown on the overlay. */
const CLASS_LABELS: Record<string, string> = {
  hand: 'ASTRONAUT HAND',
  container: 'EXPERIMENT CONTAINER',
  sample_bag: 'SAMPLE BAG',
  tool: 'LAB EQUIPMENT',
  liquid: 'SAMPLE FLUID',
  mixing_stirrer: 'STIRRING TOOL',
  cylinder: 'GAS CYLINDER',
};

function toPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export default function CameraFeed({ boxes = [], connected = false }: CameraFeedProps) {
  return (
    <div className="relative w-full aspect-video bg-space-950 rounded-lg overflow-hidden border border-space-600/40">
      {/* Simulated camera background - space station interior gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-800 via-space-900 to-space-950" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(26,140,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(26,140,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Simulated astronaut figure */}
      <div className="absolute" style={{ top: '20%', left: '15%' }}>
        <div className="w-24 h-44 rounded-t-full bg-space-600/40 border border-space-500/30 relative">
          <div className="w-20 h-20 rounded-full bg-space-500/30 border border-space-400/30 mx-auto mt-2" />
          <div className="w-16 h-24 bg-space-500/20 border border-space-400/20 mx-auto mt-2 rounded" />
        </div>
      </div>

      {/* Simulated experiment container */}
      <div className="absolute" style={{ top: '48%', left: '52%' }}>
        <div className="w-28 h-20 bg-space-700/40 border border-accent-400/20 rounded flex items-center justify-center">
          <div className="w-20 h-14 bg-accent-500/10 border border-accent-400/20 rounded-sm" />
        </div>
      </div>

      {/* Simulated lab equipment */}
      <div className="absolute" style={{ top: '62%', left: '76%' }}>
        <div className="w-16 h-20 bg-space-700/30 border border-space-500/20 rounded flex flex-col items-center justify-center gap-1">
          <div className="w-10 h-1 bg-space-500/40 rounded" />
          <div className="w-10 h-1 bg-space-500/40 rounded" />
          <div className="w-10 h-1 bg-space-500/40 rounded" />
        </div>
      </div>

      {/* Detection boxes from the live inference stream */}
      {boxes.map((box, i) => {
        const [x1, y1, x2, y2] = box.bbox;
        const label = CLASS_LABELS[box.class_name] ?? box.class_name.toUpperCase();

        return (
          <div
            key={`${box.class_name}-${i}`}
            className="absolute border border-accent-400/60 rounded transition-all duration-500"
            style={{
              top: toPercent(y1),
              left: toPercent(x1),
              width: toPercent(x2 - x1),
              height: toPercent(y2 - y1),
            }}
          >
            <div className="absolute -top-6 left-0 bg-accent-500/90 text-white text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm whitespace-nowrap">
              {label} {Math.round(box.confidence * 100)}%
            </div>
            {/* Corner markers */}
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-accent-300" />
            <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-accent-300" />
            <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-accent-300" />
            <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-accent-300" />
          </div>
        );
      })}

      {/* Scanline animation */}
      <div className="scanline" />

      {/* Top overlay bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-space-950/80 to-transparent">
        <div className="flex items-center gap-3">
          {connected ? (
            <span className="badge bg-redx-500/90 text-white">
              <span className="status-dot bg-white animate-blink" />
              LIVE
            </span>
          ) : (
            <span className="badge bg-space-700/60 text-space-300 border border-space-600/40">
              <span className="status-dot bg-space-400" />
              OFFLINE
            </span>
          )}
          <span className="text-[10px] font-mono text-space-200 tracking-wider">
            {connected ? 'MONITORING ACTIVE' : 'AWAITING SESSION'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-amberx-500/15 text-amberx-400 border border-amberx-500/30">
            DEMO / SIMULATED FEED
          </span>
        </div>
      </div>

      {/* Bottom overlay bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-gradient-to-t from-space-950/80 to-transparent">
        <div className="flex items-center gap-3">
          <Video className="w-3.5 h-3.5 text-space-300" />
          <span className="text-[10px] font-mono text-space-300 tracking-wider">CAM-01 | LAB MODULE | BAS</span>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-space-300" />
          <Maximize2 className="w-3.5 h-3.5 text-space-300" />
        </div>
      </div>

      {/* Crosshair center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-accent-400/30 rounded-full" />
    </div>
  );
}
