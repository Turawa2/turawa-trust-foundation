import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: LucideIcon;
  delay?: number;
  animate?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  suffix = '',
  prefix = '',
  icon: Icon,
  delay = 0,
  animate = true,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30"
    >
      {/* Background glow */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>

        <motion.div
          className="text-3xl md:text-4xl font-bold font-display text-foreground"
          key={displayValue}
        >
          {prefix}
          {displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          {suffix}
        </motion.div>

        <p className="mt-2 text-sm text-muted-foreground">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
