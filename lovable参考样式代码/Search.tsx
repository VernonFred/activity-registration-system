import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, ArrowLeft, SlidersHorizontal, X, TrendingUp, Clock, Calendar, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import eventCover1 from "@/assets/event-cover-1.jpg";
import eventCover2 from "@/assets/event-cover-2.jpg";
import eventCover3 from "@/assets/event-cover-3.jpg";

const recentSearches = ["论坛", "高博会", "湘江论坛", "峰会"];

const recentViews = [
  {
    id: 1,
    title: "第十一届老客户暑期培训交流会",
    date: "2023年6月18日 · 08:00 PM",
    location: "福建省，厦门市",
    status: "已开始",
    coverImage: eventCover1,
  },
  {
    id: 2,
    title: "2024创新科技峰会",
    date: "2024年1月10日 · 09:00 AM",
    location: "广东省，深圳市",
    status: "报名中",
    coverImage: eventCover3,
  },
];

const hotSearches = [
  {
    id: 1,
    title: "第八届中国高等教育博览会",
    searches: "1.23k",
    date: "今日",
    coverImage: eventCover1,
  },
  {
    id: 2,
    title: "全国创新创业大会",
    searches: "890",
    date: "昨日",
    coverImage: eventCover2,
  },
];

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentTags, setRecentTags] = useState(recentSearches);

  const removeTag = (tag: string) => {
    setRecentTags(recentTags.filter((t) => t !== tag));
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="搜索..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-muted transition-colors">
            <SlidersHorizontal className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </motion.header>

      <div className="p-5 space-y-8">
        {/* Recent Searches */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">最近搜索</h2>
            <button
              onClick={() => setRecentTags([])}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              清除全部
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {recentTags.map((tag) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border/50 rounded-full text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => {
                    setSearchQuery(tag);
                    navigate(`/search-results?q=${encodeURIComponent(tag)}`);
                  }}
                >
                  {tag}
                  <X
                    className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                  />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Recent Views */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">最近浏览</h2>
            <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
              清除全部
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {recentViews.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex-shrink-0 w-56 cursor-pointer group"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card">
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>{event.date}</span>
                    </div>
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-status-active/10 text-status-active font-medium">
                        {event.status}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Hot Searches */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-base font-semibold text-foreground mb-4">热门搜索</h2>
          <div className="space-y-3">
            {hotSearches.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-card border border-border/50 rounded-2xl cursor-pointer hover:shadow-elevated transition-all group"
                onClick={() => navigate(`/search-results?q=${encodeURIComponent(item.title)}`)}
              >
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {item.searches} 搜索
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {item.date}
                    </span>
                  </div>
                </div>
                <span className="flex-shrink-0 px-3 py-1.5 bg-gradient-primary text-primary-foreground text-xs font-medium rounded-full">
                  热门
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Search;
