import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  gradient = "from-primary to-purple-500",
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("text-center space-y-4 py-8", className)}
    >
      <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2 ring-1 ring-primary/20 shadow-lg shadow-primary/5">
        <Icon size={40} className="text-primary" />
      </div>
      <h1 className={cn(
        "text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r pb-1",
        gradient
      )}>
        {title}
      </h1>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};
