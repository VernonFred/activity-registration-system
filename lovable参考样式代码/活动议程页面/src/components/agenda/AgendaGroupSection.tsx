import { useState, useEffect } from 'react';
import { AgendaGroup } from '@/types/agenda';
import { AgendaItemCard } from './AgendaItemCard';
import { cn } from '@/lib/utils';
import { ChevronDown, User2, Clock } from 'lucide-react';

interface AgendaGroupSectionProps {
  group: AgendaGroup;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

export function AgendaGroupSection({ group, isExpanded, onToggle, index }: AgendaGroupSectionProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      setShouldAnimate(true);
    }
  }, [isExpanded]);

  return (
    <div 
      className="opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Group Header */}
      <button
        onClick={onToggle}
        className="group-header w-full mb-4"
      >
        <div className="flex items-center gap-5">
          {/* Timeline indicator */}
          <div className="relative">
            <div className="timeline-dot" />
            {!isExpanded && <div className="timeline-line opacity-30" />}
          </div>
          
          <div className="text-left">
            <h3 className="text-xl font-display font-bold text-foreground tracking-tight">
              {group.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {group.timeStart} — {group.timeEnd}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            {group.items.length} sessions
          </span>
          <ChevronDown 
            className={cn(
              "w-5 h-5 text-muted-foreground transition-all duration-500",
              isExpanded && "rotate-180 text-primary"
            )} 
          />
        </div>
      </button>

      {/* Moderator Info */}
      {group.moderator && (
        <div className={cn(
          "flex items-center gap-3 px-5 py-3 mb-4 rounded-xl transition-all duration-500",
          "bg-gradient-to-r from-secondary/80 to-secondary/40 border border-border/30",
          !isExpanded && "opacity-40"
        )}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <User2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">主持人</span>
            <span className="w-px h-4 bg-border" />
            <span className="font-semibold text-foreground">{group.moderator.name}</span>
            <span className="text-muted-foreground">{group.moderator.title}</span>
          </div>
        </div>
      )}

      {/* Items */}
      <div className={cn(
        "grid overflow-hidden transition-all duration-500 ease-out",
        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="min-h-0">
          <div className="space-y-4 pb-2 pl-8 border-l border-border/30 ml-1.5">
            {group.items.map((item, itemIndex) => (
              <AgendaItemCard 
                key={item.id} 
                item={item} 
                index={shouldAnimate ? itemIndex : 0} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
