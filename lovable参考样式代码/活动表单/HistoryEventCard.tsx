import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HistoryEventCardProps {
  id?: number;
  title: string;
  date: string;
  location: string;
  coverImage: string;
  index?: number;
}

const HistoryEventCard = ({
  id = 1,
  title,
  date,
  location,
  coverImage,
  index = 0,
}: HistoryEventCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      className="group cursor-pointer"
      onClick={() => navigate(`/event/${id}`)}
    >
      <div className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50 transition-all duration-300 hover:shadow-elevated hover:border-primary/20">
        {/* Thumbnail */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
          <img
            src={coverImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-muted transition-colors group-hover:bg-primary/10">
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default HistoryEventCard;
