import React from 'react';

export interface MeetingHealthScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function MeetingHealthScore({ score, size = 'md' }: MeetingHealthScoreProps) {
  // Determine color based on score thresholds
  const getColor = (s: number) => {
    if (s >= 80) return '#10B981'; // Green (excellent)
    if (s >= 60) return '#F59E0B'; // Amber (average)
    return '#EF4444'; // Red (needs work)
  };

  const getSizes = () => {
    switch (size) {
      case 'sm':
        return { width: 32, height: 32, strokeWidth: 3, fontSize: '10px', radius: 13 };
      case 'lg':
        return { width: 80, height: 80, strokeWidth: 6, fontSize: '20px', radius: 34 };
      case 'md':
      default:
        return { width: 54, height: 54, strokeWidth: 4.5, fontSize: '14px', radius: 22 };
    }
  };

  const { width, height, strokeWidth, fontSize, radius } = getSizes();
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center select-none font-mono">
      <svg width={width} height={height} className="transform -rotate-90">
        {/* Track Ring */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Fill Indicator */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* Center Text label */}
      <span
        style={{ fontSize, color }}
        className="absolute font-bold"
      >
        {score}
      </span>
    </div>
  );
}
