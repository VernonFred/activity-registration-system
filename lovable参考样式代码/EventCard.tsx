import { motion } from "framer-motion";
import { MapPin, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

type EventStatus = "active" | "pending" | "closed";

interface EventCardProps {
  id?: number;
  title: string;
  dateRange: string;
  location: string;
  attendees: number;
  coverImage: string;
  status: EventStatus;
  index?: number;
}

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  active: {
    label: "报名中",
    className: "bg-status-active text-status-active-foreground",
  },
  pending: {
    label: "即将开始",
    className: "bg-status-pending text-status-pending-foreground",
  },
  closed: {
    label: "已结束",
    className: "bg-status-closed text-status-closed-foreground",
  },
};

const EventCard = ({
  id = 1,
  title,
  dateRange,
  location,
  attendees,
  coverImage,
  status,
  index = 0,
}: EventCardProps) => {
  const navigate = useNavigate();
  const { label, className } = statusConfig[status];

  return (
    <motion.article
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex-shrink-0 w-72 cursor-pointer group"
      onClick={() => navigate(`/event/${id}`)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card shadow-card card-hover border border-border/50">
        {/* Cover Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>
              {label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Date */}
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{dateRange}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs">{location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs">{attendees.toLocaleString()}人</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default EventCard;
