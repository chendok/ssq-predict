import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, CheckCircle } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/common/ui/hover-card';

export interface AlgorithmDetail {
  principle?: string;
  usage?: string;
  params?: string;
  steps?: string;
}

interface AlgorithmCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
  details?: AlgorithmDetail;
  badges?: React.ReactNode;
  className?: string;
}

export const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  title,
  description,
  icon: Icon,
  selected,
  onClick,
  details,
  badges,
  className
}) => {
  const CardBody = (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-5 rounded-xl cursor-pointer transition-all duration-300 border-2 overflow-hidden h-full flex flex-col justify-between",
        selected
          ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
          : "border-muted/60 hover:border-primary/50 hover:bg-secondary/30 hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start space-x-4 relative z-10">
        <div className={cn(
          "p-3 rounded-xl transition-colors flex-shrink-0 shadow-sm",
          selected
            ? "bg-primary text-primary-foreground shadow-primary/20"
            : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-bold mb-1 transition-colors flex items-center justify-between text-lg",
            selected ? "text-primary" : "text-foreground"
          )}>
            <span className="truncate">{title}</span>
            {selected && <CheckCircle size={18} className="text-primary animate-in zoom-in duration-300 ml-2 flex-shrink-0" />}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
        </div>
      </div>

      {badges && (
        <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-2">
          {badges}
        </div>
      )}
    </div>
  );

  if (!details) return CardBody;

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        {CardBody}
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-80 p-0 overflow-hidden z-50 shadow-xl border-primary/20">
        <div className="bg-primary/5 p-4 border-b border-primary/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Icon size={18} />
            {title} 原理详解
          </div>
        </div>
        <div className="p-4 space-y-4 text-sm bg-card/95 backdrop-blur">
          {details.principle && (
            <p className="text-foreground/80 leading-relaxed">{details.principle}</p>
          )}

          {details.usage && (
            <div className="bg-secondary/50 p-2.5 rounded-lg border border-border/50">
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block mb-1">典型应用</span>
              <p className="text-xs text-foreground/90">{details.usage}</p>
            </div>
          )}

          {details.params && (
            <div>
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block mb-1">关键参数</span>
              <p className="text-xs font-mono bg-muted/50 px-2 py-1 rounded border border-border">{details.params}</p>
            </div>
          )}

          {details.steps && (
             <div>
               <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block mb-1">计算流程</span>
               <div className="text-xs text-muted-foreground whitespace-pre-line border-l-2 border-primary/30 pl-3 py-0.5">
                 {details.steps}
               </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
