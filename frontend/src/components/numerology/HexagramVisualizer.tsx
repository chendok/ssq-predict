import React from 'react';
import { HexagramHelper } from '@/lib/numerology';

interface HexagramVisualizerProps {
  upper: number;
  lower: number;
  movingLine?: number; // 1-6
  size?: number;
  className?: string;
  showLabels?: boolean;
  color?: string;
}

const HexagramVisualizer: React.FC<HexagramVisualizerProps> = ({
  upper,
  lower,
  movingLine,
  size = 200,
  className = "",
  showLabels = false,
  color = "currentColor"
}) => {
  // Get lines: 0=Yin, 1=Yang. Index 0 is bottom (Line 1).
  const lines = HexagramHelper.getLines(upper, lower);

  // Layout config
  // Total height = size.
  // 6 lines.
  // Each line height = h. Gap = g.
  // 6h + 5g = size * 0.8 (padding top/bottom)
  const padding = size * 0.1;
  const drawHeight = size - (padding * 2);
  const lineH = drawHeight / 13; // rough ratio
  const gap = drawHeight / 7;

  const w = size;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={w} height={size} viewBox={`0 0 ${w} ${size}`} className="overflow-visible">
        {lines.map((val, idx) => {
            // Line index 0 is bottom (pos 1), index 5 is top (pos 6)
            // We draw from top to bottom usually in SVG coords, but let's calculate Y from bottom up
            const pos = idx + 1;
            // idx=0 -> y should be near bottom
            const y = (size - padding) - (idx * gap) - lineH;

            const isMoving = movingLine === pos;

            return (
                <g key={idx} className="transition-all duration-300 hover:opacity-80">
                    {/* Line */}
                    {val === 1 ? (
                        // Yang: Solid
                        <rect x={padding} y={y} width={w - padding*2} height={lineH} fill={color} rx={2} />
                    ) : (
                        // Yin: Broken
                        <>
                           <rect x={padding} y={y} width={(w - padding*2)*0.45} height={lineH} fill={color} rx={2} />
                           <rect x={w - padding - (w - padding*2)*0.45} y={y} width={(w - padding*2)*0.45} height={lineH} fill={color} rx={2} />
                        </>
                    )}

                    {/* Moving Indicator */}
                    {isMoving && (
                        <circle
                          cx={w/2}
                          cy={y + lineH/2}
                          r={lineH * 1.5}
                          stroke="red"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="4 2"
                          className="animate-pulse"
                        />
                    )}

                    {/* Position Label (invisible hover target) */}
                    <title>{`Line ${pos}: ${val === 1 ? 'Yang' : 'Yin'}${isMoving ? ' (Moving)' : ''}`}</title>
                </g>
            );
        })}
      </svg>
      {showLabels && (
        <div className="text-xs mt-2 text-muted-foreground font-mono">
          [{upper}-{lower}]
        </div>
      )}
    </div>
  );
};

export default HexagramVisualizer;
