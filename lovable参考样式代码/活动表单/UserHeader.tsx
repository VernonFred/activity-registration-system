import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "./ThemeToggle";

interface UserHeaderProps {
  userName: string;
  university: string;
  avatarUrl?: string;
}

const UserHeader = ({ userName, university, avatarUrl }: UserHeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-5 py-4"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
            {userName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">你好</span>
          <h2 className="text-lg font-semibold text-foreground">{userName}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="glass rounded-full px-3 py-1.5 border border-border/50">
          <span className="text-xs text-muted-foreground">{university}</span>
        </div>
        <ThemeToggle />
        <button className="relative p-2 rounded-full glass border border-border/50 transition-colors hover:bg-foreground/5">
          <Bell className="h-5 w-5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>
      </div>
    </motion.header>
  );
};

export default UserHeader;
