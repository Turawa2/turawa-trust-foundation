import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  target: number;
  showLabels?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  showLabels = true,
}) => {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {current.toLocaleString()} ₳ raised
          </span>
          <span className="text-sm text-muted-foreground">
            Goal: {target.toLocaleString()} ₳
          </span>
        </div>
      )}

      <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-turawa-green-light"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        
        {/* Animated glow */}
        <motion.div
          className="absolute inset-y-0 rounded-full bg-primary/50 blur-sm"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '500%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'linear',
          }}
        />
      </div>

      {showLabels && (
        <div className="mt-2 text-center">
          <span className="text-lg font-bold text-primary">
            {percentage.toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground ml-2">
            of goal reached
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
