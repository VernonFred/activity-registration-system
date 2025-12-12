import { AgendaItem } from '@/types/agenda';
import { cn } from '@/lib/utils';
import { Clock, MapPin, MessageSquare, Presentation, Coffee, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AgendaItemCardProps {
  item: AgendaItem;
  index: number;
}

const typeConfig = {
  speech: {
    icon: Presentation,
    label: '演讲',
    badgeClass: 'badge-speech',
  },
  discussion: {
    icon: MessageSquare,
    label: '讨论',
    badgeClass: 'badge-discussion',
  },
  break: {
    icon: Coffee,
    label: '休息',
    badgeClass: '',
  },
  activity: {
    icon: Sparkles,
    label: '活动',
    badgeClass: 'badge-activity',
  },
};

export function AgendaItemCard({ item, index }: AgendaItemCardProps) {
  const config = typeConfig[item.type];
  const Icon = config.icon;
  const isBreak = item.type === 'break';

  if (isBreak) {
    return (
      <div 
        className="agenda-break-card opacity-0 animate-fade-in"
        style={{ animationDelay: `${index * 100 + 200}ms` }}
      >
        <div className="relative flex items-center justify-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20">
            <Coffee className="w-5 h-5 text-accent" />
          </div>
          <div>
            <span className="text-lg font-display font-semibold text-foreground">
              {item.title}
            </span>
            <p className="text-sm text-muted-foreground mt-0.5">
              {item.timeStart} — {item.timeEnd}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="agenda-card opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 100 + 200}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Time */}
        <div className="flex items-center gap-2 text-primary">
          <Clock className="w-4 h-4" />
          <span className="font-semibold text-sm tracking-wide">
            {item.timeStart} — {item.timeEnd}
          </span>
        </div>
        
        {/* Type badge */}
        <span className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
          config.badgeClass
        )}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-lg font-display font-bold text-foreground leading-snug mb-4">
        {item.title}
      </h4>

      {/* Speaker */}
      {item.speaker && (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 mb-4">
          <Avatar className="w-12 h-12 avatar-premium">
            <AvatarImage src={item.speaker.avatar} alt={item.speaker.name} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
              {item.speaker.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{item.speaker.name}</p>
            <p className="text-sm text-muted-foreground">{item.speaker.title}</p>
          </div>
        </div>
      )}

      {/* Location */}
      {item.location && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary/70" />
          <span>{item.location}</span>
        </div>
      )}
    </div>
  );
}
