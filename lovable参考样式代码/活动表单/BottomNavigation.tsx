import { motion } from "framer-motion";
import { Home, CalendarPlus, User, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "主页", icon: Home, path: "/" },
  { id: "register", label: "报名", icon: CalendarPlus, path: "/registrations" },
  { id: "profile", label: "我的", icon: User, path: "/profile" },
  { id: "ai", label: "AI助手", icon: Sparkles, path: "/ai" },
];

interface BottomNavigationProps {
  activeTab?: string;
}

const BottomNavigation = ({ activeTab: propActiveTab }: BottomNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = propActiveTab || navItems.find((item) => item.path === location.pathname)?.id || "home";

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mb-4">
        <div className="glass rounded-2xl p-2 shadow-elevated border border-border/50">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isAI = item.id === "ai";

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <div className={`relative ${isAI ? "p-1" : ""}`}>
                    {isAI ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 blur-sm" />
                        <Icon className={`relative h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                      </div>
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
