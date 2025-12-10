import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Star,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Clock,
  Users,
  Navigation,
  Image as ImageIcon,
  Play,
  Wifi,
  Coffee,
  Car,
  Building,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import eventCover1 from "@/assets/event-cover-1.jpg";
import eventCover2 from "@/assets/event-cover-2.jpg";
import eventCover3 from "@/assets/event-cover-3.jpg";

import CommentsSection from "@/components/event/CommentsSection";

type TabId = "overview" | "agenda" | "hotel" | "photos" | "comments";

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "活动速览" },
  { id: "agenda", label: "活动议程" },
  { id: "hotel", label: "酒店信息" },
  { id: "photos", label: "图片直播" },
  { id: "comments", label: "评论" },
];

const eventData = {
  id: 1,
  title: "长沙 | 第十一届老客户暑期培训交流会",
  subtitle: "暑期培训会",
  dateRange: "2023.03.30-2023.03.31",
  deadline: "04月14日00:00 截止报名",
  location: "长沙市 | 喜来登大酒店",
  address: "长沙市江发路12号国博园东门",
  distance: "401.9km",
  currentAttendees: 215,
  isFree: true,
  coverImage: eventCover2,
  description: `面对客渡你梳妆新创新之路，做好机应对准备，以有思路才的王生力量促进全国优质医疗机构高质量发展，搭建学术交流和思想碰撞的平台，由多方主办的"第一届全国优质医疗机构发展论坛"将于2023年9月24日在长沙举办。`,
  attendeeAvatars: [eventCover1, eventCover2, eventCover3],
};

const agendaItems = [
  { time: "08:00-09:00", title: "签到入场", location: "一楼大厅" },
  { time: "09:00-09:30", title: "开幕式", location: "主会场A厅" },
  { time: "09:30-10:30", title: "主题演讲：行业发展趋势", location: "主会场A厅", speaker: "张教授" },
  { time: "10:30-10:50", title: "茶歇", location: "休息区" },
  { time: "10:50-12:00", title: "圆桌论坛：创新与实践", location: "主会场A厅" },
  { time: "12:00-14:00", title: "午餐", location: "宴会厅" },
  { time: "14:00-15:30", title: "分论坛A：技术专场", location: "会议室201" },
  { time: "14:00-15:30", title: "分论坛B：管理专场", location: "会议室202" },
  { time: "15:30-17:00", title: "工作坊：实践操作", location: "培训中心" },
  { time: "18:00-20:00", title: "欢迎晚宴", location: "宴会厅" },
];

const hotelInfo = {
  name: "长沙喜来登大酒店",
  stars: 5,
  address: "长沙市江发路12号国博园东门",
  phone: "0731-88888888",
  checkIn: "14:00",
  checkOut: "12:00",
  amenities: ["免费WiFi", "健身中心", "游泳池", "餐厅", "停车场", "会议室"],
  rooms: [
    { type: "标准双床房", price: 688, available: 12 },
    { type: "豪华大床房", price: 888, available: 8 },
    { type: "商务套房", price: 1288, available: 3 },
  ],
  images: [eventCover1, eventCover2, eventCover3],
};

const photoGallery = [
  { id: 1, src: eventCover1, likes: 234, isVideo: false },
  { id: 2, src: eventCover2, likes: 189, isVideo: true },
  { id: 3, src: eventCover3, likes: 456, isVideo: false },
  { id: 4, src: eventCover1, likes: 123, isVideo: false },
  { id: 5, src: eventCover2, likes: 567, isVideo: false },
  { id: 6, src: eventCover3, likes: 345, isVideo: true },
];

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const [isRegistered] = useState(true); // Toggle this to test different states

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "agenda":
        return <AgendaTab />;
      case "hotel":
        return <HotelTab />;
      case "photos":
        return <PhotosTab />;
      case "comments":
        return <CommentsSection isRegistered={isRegistered} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="relative h-72 overflow-hidden">
          <img
            src={eventData.coverImage}
            alt={eventData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/30 backdrop-blur-md text-foreground hover:bg-background/50 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </motion.button>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground mb-1"
          >
            {eventData.subtitle}
          </motion.p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="pb-24"
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-6">
            <button className="flex flex-col items-center gap-1 text-primary">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-xs">收藏</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs">评论</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Heart className="h-5 w-5" />
              <span className="text-xs">点赞</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="h-5 w-5" />
              <span className="text-xs">分享</span>
            </button>
          </div>
          <button className="px-8 py-3 bg-gradient-primary text-primary-foreground font-semibold rounded-full shadow-glow hover:opacity-90 transition-opacity">
            立即报名
          </button>
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = () => (
  <div className="p-5 space-y-6">
    {/* Title */}
    <div>
      <h1 className="text-xl font-bold text-foreground mb-2">{eventData.title}</h1>
      {eventData.isFree && (
        <span className="inline-block px-3 py-1 bg-status-active/10 text-status-active text-sm font-medium rounded-full border border-status-active/20">
          免费
        </span>
      )}
    </div>

    {/* Date & Time */}
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">{eventData.dateRange}</p>
          <p className="text-xs text-muted-foreground">以实际情况为准</p>
        </div>
        <span className="ml-auto text-xs text-primary">{eventData.deadline}</span>
      </div>

      <div className="flex items-center gap-3">
        <MapPin className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{eventData.location}</p>
          <p className="text-xs text-muted-foreground">{eventData.address}</p>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Navigation className="h-4 w-4" />
          <span className="text-xs">{eventData.distance}</span>
        </div>
      </div>
    </div>

    {/* Attendees */}
    <div className="p-4 bg-card rounded-2xl border border-border/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">目前报名人数</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-foreground">{eventData.currentAttendees}</span>
            <span className="text-sm text-muted-foreground">人</span>
            <div className="flex -space-x-2">
              {eventData.attendeeAvatars.map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
          火热报名中
        </span>
      </div>
    </div>

    {/* Description */}
    <div>
      <h2 className="text-base font-semibold text-foreground mb-3">活动介绍</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{eventData.description}</p>
    </div>
  </div>
);

// Agenda Tab Component
const AgendaTab = () => (
  <div className="p-5">
    <h2 className="text-base font-semibold text-foreground mb-4">活动日程安排</h2>
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-border" />
      
      <div className="space-y-4">
        {agendaItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-4"
          >
            {/* Timeline Dot */}
            <div className="relative z-10 mt-1.5">
              <div className={`w-4 h-4 rounded-full border-2 ${
                index === 0 ? "bg-primary border-primary" : "bg-background border-border"
              }`} />
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="p-4 bg-card rounded-xl border border-border/50 hover:shadow-elevated transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {item.time}
                  </span>
                  {item.speaker && (
                    <span className="text-xs text-muted-foreground">{item.speaker}</span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">{item.location}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Hotel Tab Component
const HotelTab = () => (
  <div className="p-5 space-y-6">
    {/* Hotel Info */}
    <div className="p-4 bg-card rounded-2xl border border-border/50">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={hotelInfo.images[0]}
          alt={hotelInfo.name}
          className="w-24 h-24 rounded-xl object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-foreground">{hotelInfo.name}</h2>
            <div className="flex">
              {[...Array(hotelInfo.stars)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{hotelInfo.address}</p>
          <p className="text-xs text-primary">{hotelInfo.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">入住时间</p>
            <p className="text-sm font-medium text-foreground">{hotelInfo.checkIn}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">退房时间</p>
            <p className="text-sm font-medium text-foreground">{hotelInfo.checkOut}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Amenities */}
    <div>
      <h3 className="text-base font-semibold text-foreground mb-3">酒店设施</h3>
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Wifi, label: "免费WiFi" },
          { icon: Coffee, label: "餐厅" },
          { icon: Car, label: "停车场" },
          { icon: Building, label: "健身中心" },
          { icon: Users, label: "会议室" },
          { icon: Star, label: "游泳池" },
        ].map((amenity, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 p-3 bg-muted/50 rounded-xl border border-border/50"
          >
            <amenity.icon className="h-5 w-5 text-primary" />
            <span className="text-xs text-foreground">{amenity.label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Room Options */}
    <div>
      <h3 className="text-base font-semibold text-foreground mb-3">房型选择</h3>
      <div className="space-y-3">
        {hotelInfo.rooms.map((room, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50"
          >
            <div>
              <h4 className="text-sm font-medium text-foreground">{room.type}</h4>
              <p className="text-xs text-muted-foreground">剩余 {room.available} 间</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">¥{room.price}</p>
              <p className="text-xs text-muted-foreground">/晚</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Hotel Images */}
    <div>
      <h3 className="text-base font-semibold text-foreground mb-3">酒店图片</h3>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {hotelInfo.images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            className="w-32 h-24 rounded-xl object-cover flex-shrink-0"
          />
        ))}
      </div>
    </div>
  </div>
);

// Photos Tab Component
const PhotosTab = () => (
  <div className="p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-foreground">活动精彩瞬间</h2>
      <span className="text-xs text-muted-foreground">{photoGallery.length} 张照片</span>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      {photoGallery.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
        >
          <img
            src={photo.src}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {photo.isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center">
                <Play className="h-5 w-5 text-white fill-white ml-1" />
              </div>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 text-white text-xs">
              <Heart className="h-3.5 w-3.5" />
              <span>{photo.likes}</span>
            </div>
            {!photo.isVideo && (
              <ImageIcon className="h-4 w-4 text-white" />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default EventDetail;
