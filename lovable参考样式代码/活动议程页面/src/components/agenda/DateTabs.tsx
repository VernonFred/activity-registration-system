import { ConferenceDay } from '@/types/agenda';
import { cn } from '@/lib/utils';

interface DateTabsProps {
  days: ConferenceDay[];
  activeDay: string;
  onDayChange: (dayId: string) => void;
}

export function DateTabs({ days, activeDay, onDayChange }: DateTabsProps) {
  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2 px-1">
        {days.map((day, index) => {
          const isActive = activeDay === day.id;
          const dayNum = index + 1;
          
          return (
            <button
              key={day.id}
              onClick={() => onDayChange(day.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-6 py-4 rounded-2xl transition-all duration-500 whitespace-nowrap min-w-[120px]",
                "opacity-0 animate-fade-in",
                isActive 
                  ? "date-tab-active" 
                  : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className={cn(
                "text-xs font-medium uppercase tracking-wider",
                isActive ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                Day {dayNum}
              </span>
              <span className={cn(
                "text-lg font-display font-semibold",
                isActive ? "text-primary-foreground" : "text-foreground"
              )}>
                {day.displayText}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
