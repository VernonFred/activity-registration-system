import { motion } from "framer-motion";
import { Search as SearchIcon, ArrowLeft, SlidersHorizontal, Heart, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import eventCover1 from "@/assets/event-cover-1.jpg";
import eventCover2 from "@/assets/event-cover-2.jpg";
import eventCover3 from "@/assets/event-cover-3.jpg";

const categories = [
  { id: "all", label: "所有活动", icon: "🎯" },
  { id: "forum", label: "论坛", icon: "🌐" },
  { id: "summit", label: "峰会", icon: "🎵" },
  { id: "workshop", label: "工作坊", icon: "💡" },
];

const searchResults = [
  {
    id: 1,
    title: "第十一届老客户暑期培训交流会",
    location: "福建省，厦门市",
    rating: 4.4,
    reviews: 532,
    coverImage: eventCover1,
    isFavorite: false,
  },
  {
    id: 2,
    title: "2024创新科技峰会年度盛典",
    location: "广东省，深圳市",
    rating: 4.8,
    reviews: 1024,
    coverImage: eventCover2,
    isFavorite: true,
  },
  {
    id: 3,
    title: "全国高校创业创新论坛",
    location: "湖南省，长沙市",
    rating: 4.6,
    reviews: 768,
    coverImage: eventCover3,
    isFavorite: false,
  },
  {
    id: 4,
    title: "人工智能教育应用研讨会",
    location: "北京市，海淀区",
    rating: 4.5,
    reviews: 456,
    coverImage: eventCover1,
    isFavorite: false,
  },
];

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "活动";
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([2]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-8">
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
              defaultValue={query}
              placeholder="搜索..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-muted transition-colors">
            <SlidersHorizontal className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </motion.header>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-5 py-4"
      >
        <h2 className="text-base font-semibold text-foreground">
          发现活动 <span className="text-primary">({searchResults.length * 8})</span>
        </h2>
      </motion.div>

      {/* Results Grid */}
      <div className="px-5">
        <div className="grid grid-cols-2 gap-4">
          {searchResults.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(event.id, e)}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
                      favorites.includes(event.id)
                        ? "bg-primary/90 text-primary-foreground"
                        : "bg-background/60 backdrop-blur-sm text-foreground hover:bg-background/80"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorites.includes(event.id) ? "fill-current" : ""}`}
                    />
                  </button>
                </div>

                <div className="p-3 space-y-2">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium text-foreground">
                      {event.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({event.reviews})
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs truncate">{event.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
