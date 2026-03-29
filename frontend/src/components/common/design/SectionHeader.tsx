import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon: Icon, className, children }) => {
  return (
    <div className={cn("flex items-center justify-between mb-6 pb-2 border-b border-border/40", className)}>
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Icon size={20} />
          </div>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-foreground/90">{title}</h2>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
};
