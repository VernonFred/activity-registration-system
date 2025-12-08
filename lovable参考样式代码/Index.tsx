import { motion } from "framer-motion";
import UserHeader from "@/components/UserHeader";
import SearchBar from "@/components/SearchBar";
import SectionHeader from "@/components/SectionHeader";
import EventCard from "@/components/EventCard";
import HistoryEventCard from "@/components/HistoryEventCard";
import BottomNavigation from "@/components/BottomNavigation";

import eventCover1 from "@/assets/event-cover-1.jpg";
import eventCover2 from "@/assets/event-cover-2.jpg";
import eventCover3 from "@/assets/event-cover-3.jpg";

const featuredEvents = [
  {
    id: 1,
    title: "第八届中国高等教育博览会",
    dateRange: "12月20日 - 12月22日",
    location: "长沙",
    attendees: 1234,
    coverImage: eventCover1,
    status: "active" as const,
  },
  {
    id: 2,
    title: "创意设计工作坊：品牌视觉系统构建",
    dateRange: "12月15日",
    location: "上海",
    attendees: 89,
    coverImage: eventCover2,
    status: "pending" as const,
  },
  {
    id: 3,
    title: "2024创新科技峰会",
    dateRange: "1月10日 - 1月12日",
    location: "深圳",
    attendees: 2560,
    coverImage: eventCover3,
    status: "active" as const,
  },
];

const historyEvents = [
  {
    id: 4,
    title: "第十五届全国大学生创新创业年会",
    date: "11月25日",
    location: "武汉",
    coverImage: eventCover1,
  },
  {
    id: 5,
    title: "AI人工智能教育应用研讨会",
    date: "11月18日",
    location: "北京",
    coverImage: eventCover3,
  },
  {
    id: 6,
    title: "高校科研成果转化交流会",
    date: "11月10日",
    location: "杭州",
    coverImage: eventCover2,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-28">
      {/* User Header */}
      <UserHeader
        userName="王小利"
        university="湖南大学"
      />

      {/* Search Bar */}
      <SearchBar />

      {/* Carousel Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-5 mb-6"
      >
        <div className="flex items-center gap-2 justify-center">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === 2
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Featured Events Section */}
      <section className="mb-8">
        <SectionHeader title="热门精选" delay={0.15} />
        <div className="flex gap-4 px-5 overflow-x-auto hide-scrollbar pb-2">
          {featuredEvents.map((event, index) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              dateRange={event.dateRange}
              location={event.location}
              attendees={event.attendees}
              coverImage={event.coverImage}
              status={event.status}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* History Events Section */}
      <section className="px-5">
        <SectionHeader title="历史活动" delay={0.25} />
        <div className="space-y-3">
          {historyEvents.map((event, index) => (
            <HistoryEventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={event.date}
              location={event.location}
              coverImage={event.coverImage}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
