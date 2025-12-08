import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="px-5 mb-6"
    >
      <div className="relative flex items-center gap-3">
        <div
          className="relative flex-1 cursor-pointer"
          onClick={() => navigate("/search")}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <div className="w-full h-12 pl-11 pr-4 bg-muted/50 border border-border/50 rounded-xl text-muted-foreground flex items-center text-sm">
            搜索活动、会议、讲座...
          </div>
        </div>
        <button className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-transform hover:scale-105 active:scale-95">
          <SlidersHorizontal className="h-5 w-5 text-primary-foreground" />
        </button>
      </div>
    </motion.div>
  );
};

export default SearchBar;
