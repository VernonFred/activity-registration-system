import { motion } from "framer-motion";
import { ChevronDown, Star, MapPin, ArrowRight, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";

import eventCover1 from "@/assets/event-cover-1.jpg";
import eventCover2 from "@/assets/event-cover-2.jpg";
import eventCover3 from "@/assets/event-cover-3.jpg";

type StatusFilter = "all" | "started" | "ended" | "upcoming";

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "started", label: "已开始" },
  { id: "ended", label: "已结束" },
  { id: "upcoming", label: "延期" },
];

const registrations = [
  {
    id: 1,
    title: "上海 | 沉浸式奔跑赛事，嘟嘟(艺术中心首发)",
    dateRange: "2023.03.11-06.10",
    location: "上海 WWAC奇观艺术中心",
    rating: 4.4,
    reviews: 532,
    coverImage: eventCover1,
    status: "started" as const,
    isFree: true,
  },
  {
    id: 2,
    title: "第八届中国高等教育博览会",
    dateRange: "2023.12.20-22",
    location: "长沙国际会展中心",
    rating: 4.8,
    reviews: 1234,
    coverImage: eventCover2,
    status: "started" as const,
    isFree: false,
  },
  {
    id: 3,
    title: "全国创新创业大会年度盛典",
    dateRange: "2023.11.15-18",
    location: "深圳会展中心",
    rating: 4.6,
    reviews: 890,
    coverImage: eventCover3,
    status: "ended" as const,
    isFree: true,
  },
  {
    id: 4,
    title: "人工智能教育应用研讨会",
    dateRange: "2024.01.10-12",
    location: "北京国家会议中心",
    rating: 4.5,
    reviews: 456,
    coverImage: eventCover1,
    status: "upcoming" as const,
    isFree: false,
  },
];

const Registrations = () => {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("started");
  const [selectedEvent, setSelectedEvent] = useState<number | null>(1);

  const filteredEvents = registrations.filter(
    (event) => activeStatus === "all" || event.status === activeStatus
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="px-5 py-4">
          <h1 className="text-xl font-bold text-foreground text-center">报名</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-lg text-sm text-foreground">
              城市
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-lg text-sm text-foreground">
              时间
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-lg text-sm text-foreground">
              状态
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <button className="p-2 rounded-lg bg-muted/50 border border-border/50">
            <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 px-5 pb-4">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveStatus(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeStatus === filter.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.header>

      {/* Event List */}
      <div className="p-5 space-y-4">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative overflow-hidden rounded-2xl transition-all cursor-pointer ${
              selectedEvent === event.id
                ? "ring-2 ring-primary shadow-glow"
                : "border border-border/50"
            }`}
            onClick={() => {
              setSelectedEvent(event.id);
              navigate(`/event/${event.id}`);
            }}
          >
            <div className="flex gap-4 p-4 bg-card">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                {event.isFree && (
                  <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-status-active/90 text-status-active-foreground text-xs font-medium rounded">
                    免费
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                  {event.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-medium text-foreground">
                    {event.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({event.reviews})
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs">{event.dateRange}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-xs truncate">{event.location}</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex flex-col items-end justify-between">
                <button className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors">
                  去报名
                </button>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNavigation activeTab="register" />
    </div>
  );
};

export default Registrations;
