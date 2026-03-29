import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/common/ui/badge';
import { cn } from '@/lib/utils';

interface LotteryBallProps {
  number: number;
  variant: 'red' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  delay?: number;
  className?: string;
}

export const LotteryBall: React.FC<LotteryBallProps> = ({
  number,
  variant,
  size = 'md',
  animate = true,
  delay = 0,
  className
}) => {
  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 md:w-16 md:h-16 text-2xl",
    lg: "w-16 h-16 md:w-20 md:h-20 text-3xl",
  };

  const colorClasses = {
    red: "bg-ball-red shadow-ball-red/40 border-ball-red/20",
    blue: "bg-ball-blue shadow-ball-blue/40 border-ball-blue/20",
  };

  const content = (
    <Badge
      variant={variant === 'red' ? 'destructive' : 'secondary'}
      className={cn(
        "rounded-full font-bold flex items-center justify-center shadow-lg border-4 text-white font-mono transition-transform hover:scale-110",
        sizeClasses[size],
        colorClasses[variant],
        className
      )}
    >
      {number.toString().padStart(2, '0')}
    </Badge>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ scale: 0, rotate: variant === 'red' ? -180 : 180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 15 }}
    >
      {content}
    </motion.div>
  );
};
