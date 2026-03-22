import { useState } from "react";

interface Props {
  cx: number;
  cy: number;
  color: string;
  initial: string;
  onDelete: () => void;
}

export const PlotDot = ({ cx, cy, color, initial, onDelete }: Props) => {
  const [hovered, setHovered] = useState(false);

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      style={{ cursor: "pointer", pointerEvents: "all" }}
    >
      <circle cx={cx} cy={cy} r={12} fill={color} stroke="white" strokeWidth={1.5} />
      <text
        x={cx}
        y={cy}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={10}
        fill="white"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {hovered ? "x" : initial}
      </text>
      {/* Expanded hit target — visual 12px + 4px padding (D-09) */}
      <circle cx={cx} cy={cy} r={16} fill="transparent" />
    </g>
  );
};
