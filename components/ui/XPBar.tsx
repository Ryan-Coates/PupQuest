interface XPBarProps {
  xp: number;
  level: number;
  className?: string;
  showLabels?: boolean;
}

import { getXPProgress, getLevelFromXP, getNextLevel } from '@/lib/xp';

export function XPBar({ xp, level, className = '', showLabels = true }: XPBarProps) {
  const { current, needed, percentage } = getXPProgress(xp);
  const levelInfo = getLevelFromXP(xp);
  const nextLevel = getNextLevel(level);

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-indigo-600">
            {levelInfo.badge} Lv.{level} {levelInfo.name}
          </span>
          <span className="text-xs text-gray-400">
            {current}/{needed} XP
          </span>
        </div>
      )}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full xp-bar transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabels && nextLevel && (
        <p className="text-xs text-gray-400 mt-1 text-right">{needed - current} XP to Lv.{nextLevel.level}</p>
      )}
    </div>
  );
}
