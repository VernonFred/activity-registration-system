import { useState, useEffect, useCallback } from 'react';
import { conferenceData } from '@/data/mockAgenda';
import { DateTabs } from './DateTabs';
import { AgendaGroupSection } from './AgendaGroupSection';
import { ThemeToggle } from './ThemeToggle';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';

const STORAGE_KEY = 'agenda-expanded-groups';

export function AgendaPage() {
  const [activeDay, setActiveDay] = useState(conferenceData.days[0]?.id || '');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setExpandedGroups(JSON.parse(stored));
      } catch {
        initializeDefaultExpanded();
      }
    } else {
      initializeDefaultExpanded();
    }
  }, []);

  const initializeDefaultExpanded = () => {
    const defaults: Record<string, boolean> = {};
    conferenceData.days.forEach(day => {
      if (day.groups[0]) {
        defaults[day.groups[0].id] = true;
      }
    });
    setExpandedGroups(defaults);
  };

  useEffect(() => {
    if (Object.keys(expandedGroups).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedGroups));
    }
  }, [expandedGroups]);

  const currentDay = conferenceData.days.find(d => d.id === activeDay);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }, []);

  const expandAll = useCallback(() => {
    if (!currentDay) return;
    const allExpanded: Record<string, boolean> = { ...expandedGroups };
    currentDay.groups.forEach(g => {
      allExpanded[g.id] = true;
    });
    setExpandedGroups(allExpanded);
  }, [currentDay, expandedGroups]);

  const collapseAll = useCallback(() => {
    if (!currentDay) return;
    const allCollapsed: Record<string, boolean> = { ...expandedGroups };
    currentDay.groups.forEach(g => {
      allCollapsed[g.id] = false;
    });
    setExpandedGroups(allCollapsed);
  }, [currentDay, expandedGroups]);

  const allExpanded = currentDay?.groups.every(g => expandedGroups[g.id]) ?? false;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Mesh gradient background */}
      <div className="mesh-gradient" />
      
      {/* Floating orbs */}
      <div className="floating-orb w-96 h-96 bg-primary/20 top-20 -right-48" />
      <div className="floating-orb w-80 h-80 bg-accent/20 bottom-40 -left-40" style={{ animationDelay: '-5s' }} />
      <div className="floating-orb w-64 h-64 bg-primary/15 top-1/2 right-1/4" style={{ animationDelay: '-10s' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="container max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-30 blur-lg animate-glow-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gradient">
                  {conferenceData.title}
                </h1>
                <p className="text-sm text-muted-foreground font-medium tracking-wide">
                  Conference Agenda
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Date Tabs */}
          <DateTabs
            days={conferenceData.days}
            activeDay={activeDay}
            onDayChange={setActiveDay}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container max-w-5xl mx-auto px-6 py-8">
        {/* Expand/Collapse All */}
        <div className="flex justify-end mb-8">
          <button
            onClick={allExpanded ? collapseAll : expandAll}
            className="expand-btn flex items-center gap-2 group"
          >
            {allExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>收起全部</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                <span>展开全部</span>
              </>
            )}
          </button>
        </div>

        {/* Groups */}
        <div className="space-y-8">
          {currentDay?.groups.map((group, index) => (
            <AgendaGroupSection
              key={group.id}
              group={group}
              isExpanded={expandedGroups[group.id] ?? false}
              onToggle={() => toggleGroup(group.id)}
              index={index}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 全球人工智能大会组委会 · Crafted with precision
          </p>
        </footer>
      </main>
    </div>
  );
}
