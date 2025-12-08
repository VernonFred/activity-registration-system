import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  showMore?: boolean;
  delay?: number;
}

const SectionHeader = ({ title, showMore = true, delay = 0 }: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center justify-between px-5 mb-4"
    >
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {showMore && (
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          <span>查看全部</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
};

export default SectionHeader;
