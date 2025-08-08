import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/providers/LanguageProvider";
import { Building, CheckCircle2, MapPin, Lock, WifiIcon, BellRing, CalendarDays, Users, Home, DoorOpen, ArrowUpCircle ,ChevronLeft,ChevronRight} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, format, subMonths,addMonths,isSameDay, parseISO } from "date-fns"; 
import dayjs from "dayjs";

type Announcement = {
  id: string;
  title: string;
  content: string;
  publish_date: string;
  important: boolean;
  action: string;
};

export default function LandingPage() {
  const { t, language } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [imageIndexes, setImageIndexes] = useState([0, 0, 0]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [stats, setStats] = useState({
    totalRooms: 9,
    availableRooms: 3,
    totalTenants: 6
  });

  const roomTypes = [
    {
      id: 1,
      images: [
        "https://i.ibb.co/gMBBxJp5/4.jpg",
      ],
    },
    {
      id: 2,
      images: [
        "https://i.ibb.co/nqLg8FsD/1.jpg",
      ],
    },
    {
      id: 3,
      images: [
        "https://i.ibb.co/HRsDfk0/5.jpg",
      ],
    },
  ];


useEffect(() => {
  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("publish_date", { ascending: false })
      .limit(10); // ดึงมาเยอะหน่อย แล้วค่อยกรองเอง

    if (!error && data) {
      const filtered = data.filter((announcement: Announcement) => {
        const days = differenceInDays(new Date(), new Date(announcement.publish_date));
        return days <= 7;
      });

      setAnnouncements(filtered as Announcement[]);
    }
  };

  fetchAnnouncements();
}, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndexes((prev) =>
        prev.map((idx, i) =>
          (idx + 1) % roomTypes[i].images.length
        )
      );
    }, 2500); 

    return () => clearInterval(interval);
  }, [roomTypes]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("publish_date", { ascending: false })
        .limit(5); 

      if (!error && data) {
        setAnnouncements(data as Announcement[]);
      }
    };

    fetchAnnouncements();
  }, []);

  // Effect for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("publish_date", { ascending: false });
    if (!error && data) {
      setAnnouncements(data);
    }
  };

  useEffect(() => {
    const updateOldAnnouncements = async () => {
      const today = dayjs();

      // ดึงประกาศที่ action = "1"
      const { data: announcements, error } = await supabase
        .from("announcements")
        .select("id, created_at, action")
        .eq("action", "1");

      if (error) {
        console.error("Error fetching announcements:", error);
        return;
      }

      if (!announcements) return;

      // กรองประกาศที่เกิน 7 วันจาก created_at
      const expired = announcements.filter((a) => {
        if (!a.created_at) return false;
        const diffDays = today.diff(dayjs(a.created_at), "day");
        return diffDays > 7;
      });

      // อัปเดต action เป็น "2"
      for (const ann of expired) {
        const { error: updateError } = await supabase
          .from("announcements")
          .update({ action: "2" })
          .eq("id", ann.id);

        if (updateError) {
          console.error(`Failed to update announcement id=${ann.id}:`, updateError);
        }
      }

      // รีโหลดข้อมูลหลังอัพเดตเสร็จ
      await fetchAnnouncements();
    };

    updateOldAnnouncements();
  }, []);


  const features = [
    {
      icon: WifiIcon,
      title: "Free Wi-Fi",
      titleTh: "Wi-Fi ฟรี",
      description: "High-speed internet in all rooms",
      descriptionTh: "อินเทอร์เน็ตความเร็วสูงในทุกห้อง",
    },
    {
      icon: Lock,
      title: "24/7 Security",
      titleTh: "ระบบรักษาความปลอดภัย 24 ชม.",
      description: "CCTV and keycard access system",
      descriptionTh: "ระบบ CCTV และคีย์การ์ด",
    },
    {
      icon: Building,
      title: "Modern Facilities",
      titleTh: "สิ่งอำนวยความสะดวกทันสมัย",
      description: "laundry, and common areas",
      descriptionTh: " ซักรีด และพื้นที่ส่วนกลาง",
    },
    {
      icon: MapPin,
      title: "Prime Location",
      titleTh: "ทำเลดี",
      description: "Close to universities and shopping centers",
      descriptionTh: "ใกล้มหาวิทยาลัยและห้างสรรพสินค้า",
    },
  ];
  const roomDetailsTitle = language === 'th' ? 'รายละเอียดห้องพัก' : 'Room Details';

  const statsCards = [
    {
      title: language === 'th' ? 'ห้องทั้งหมด' : 'Total Rooms',
      value: stats.totalRooms,
      icon: Home
    },
    {
      title: language === 'th' ? 'ห้องที่ว่าง' : 'Available Rooms',
      value: stats.availableRooms,
      icon: DoorOpen
    },
    {
      title: language === 'th' ? 'ผู้เช่าทั้งหมด' : 'Total Tenants',
      value: stats.totalTenants,
      icon: Users
    }
  ];
  
   const currentMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // เช็คว่ามีประกาศในวันที่ระบุไหม
 const hasAnnouncementOnDate = (date: Date) => {
  return announcements.some(
    (a) =>
      a.action === "1" &&
      format(new Date(a.publish_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  );
};

 const [currentDate, setCurrentDate] = useState(new Date());
 const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
 const [newAnnouncement, setNewAnnouncement] = useState<Omit<Announcement, "id">>({
     title: "",
     content: "",
     publish_date: new Date().toISOString().split("T")[0],
     important: false,
     action:"",
   });
  // เลื่อนเดือน
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // fetch ประกาศ พร้อมกรองวันที่ไม่เกิน 7 วัน และอัปเดต action เป็น "2" ถ้าเกิน 7 วัน
  useEffect(() => {
    const fetchAndUpdateAnnouncements = async () => {
      const today = dayjs();

      const { data: anns, error } = await supabase
        .from("announcements")
        .select("*")
        .order("publish_date", { ascending: false });

      if (error) {
        console.error("Error fetching announcements:", error);
        return;
      }

      if (!anns) return;

      // อัปเดตประกาศที่เก่าเกิน 7 วัน (action === "1") เป็น "2"
      for (const ann of anns) {
        if (ann.action === "1" && ann.created_at) {
          const diffDays = today.diff(dayjs(ann.created_at), "day");
          if (diffDays > 7) {
            await supabase
              .from("announcements")
              .update({ action: "2" })
              .eq("id", ann.id);
          }
        }
      }

      // กรองประกาศ action = "1" และ publish_date ไม่เกิน 7 วัน
      const filtered = anns.filter((a) => {
        if (a.action !== "1") return false;
        if (!a.publish_date) return false;
        const diffDays = differenceInDays(new Date(), new Date(a.publish_date));
        return diffDays <= 7;
      });

      setAnnouncements(filtered);
    };

    fetchAndUpdateAnnouncements();
  }, []);

  // Image slider auto update
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndexes((prev) =>
        prev.map((idx, i) => (idx + 1) % roomTypes[i].images.length)
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [roomTypes]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary">
                  {t("app.title")}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Link to="/login">
                <Button variant="default">{t("auth.login")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 z-0"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
              {t("welcome.title")}
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
              {t("welcome.subtitle")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">{t("welcome.login")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-8 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {t("welcome.features")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-lg shadow-sm border border-border flex flex-col items-center text-center"
              >
                <div className="inline-flex items-center justify-center rounded-md p-2 bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium">
                  {language === "en" ? feature.title : feature.titleTh}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {language === "en"
                    ? feature.description
                    : feature.descriptionTh}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>      <div style={{ backgroundColor: '#fb8c00' }} className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 text-center">{roomDetailsTitle}</h2>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {statsCards.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  {<stat.icon className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Available Rooms */}
      <div className="py-8 sm:py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {t("welcome.explore")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((room) => (
              <div
                key={room.id}
                className="bg-card rounded-lg overflow-hidden shadow-md border border-border flex flex-col"
              >
                <div className="w-full h-[400px] overflow-hidden cursor-pointer" onClick={() => setModalImage(room.images[0])}>
                  <img
                    src={room.images[0]}
                    alt={`Room ${room.id}`}
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal รูปภาพ */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Room Large"
            className="w-full max-w-[90vw] max-h-[80vh] sm:max-w-[600px] md:max-w-[800px] h-auto rounded-lg shadow-lg border-4 border-white"
            onClick={e => e.stopPropagation()}
          />
          
        </div>
      )
      }

      {/* Back to Top Button */}


            
      {/* Calendar Section */}
      { /* ข้อความอธิบายเหนือ Calendar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-card rounded-lg shadow p-4 text-center">
          <h3 className="text-xl font-semibold mb-2">{t("calendar.infoTitle")}</h3>
          <p className="text-muted-foreground">{t("calendar.infoDesc")}</p>
        </div>
      </div>
      <div className="py-8 sm:py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-foreground 
              bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70
              animate-fade-in"
            >
              {t("calendar.title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("calendar.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div className="bg-card rounded-xl shadow-lg border border-border/50 p-4 sm:p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("announcements.calendar")}</CardTitle>
                  <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="mx-2 w-28 text-center">{format(currentDate, "MMMM yyyy")}</div>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-xs font-medium py-1">
                      {t(`days.${day}`)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {currentMonthDays().map((date, i) => {
                    if (!date) return <div key={i} />;
                    if (date.getMonth() !== currentDate.getMonth()) return <div key={i} className="text-gray-400 p-2" />;

                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const has = hasAnnouncementOnDate(date);
                    return (
                      <Button
                        key={i}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-12 p-0 ${has ? "border-primary" : ""}`}
                        onClick={() => {
                          setSelectedDate(date);
                          setNewAnnouncement((prev) => ({
                            ...prev,
                            publish_date: format(date, "yyyy-MM-dd"),
                            action: "1",
                          }));
                        }}
                      >
                        <div className="relative w-full h-full flex items-center justify-center">
                          {date.getDate()}
                          {has && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"></div>}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </div>

            {/* Announcements */}
            <div
              className="bg-card rounded-xl shadow-lg border border-border/50 p-4 sm:p-6
              transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <BellRing className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">{t("announcements.title")}</h3>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {announcements.length > 0 ? (
                  announcements
                    .filter((announcement) => announcement.action === "1")
                    .slice(0, 7)
                    .map((announcement) => (
                      <div
                        key={announcement.id}
                        className="p-4 bg-muted/50 rounded-lg border border-border/50
                        hover:bg-muted/70 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {announcement.title}
                            </h4>
                            {announcement.important && (
                              <Badge variant="destructive" className="ml-2">
                                {t("announcements.important")}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>{format(parseISO(announcement.publish_date), "d MMMM yyyy")}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground mt-2">{announcement.content}</p>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <BellRing className="mx-auto h-12 w-12 mb-3 text-muted-foreground" />
                    <p>{t("announcements.noAvailable")}</p>
                  </div>
                )}
        </div>
      </div>
      </div>
      </div>
      </div>
      {/* Back to Top Button */}
      {showBackToTop && (
        <div
          className="fixed bottom-4 right-4 z-50"
          onClick={scrollToTop}
        >
          <Button className="rounded-full p-3 bg-primary text-primary-foreground shadow-md
            transition-all duration-300 hover:scale-110 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-background text-foreground border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold mb-4">{t("app.title")}</h3>
              <div className="w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d123948.80735360993!2d99.8125109!3d13.8750008!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e2e592573eac1f%3A0xc0b0318b7fb3fd64!2z4Lia4LmJ4Liy4LiZ4Lie4Li44LiX4LiY4LiK4Liy4LiV4Li0IOC4meC4hOC4o-C4m-C4kOC4oQ!5e0!3m2!1sth!2sth!4v1748183614363!5m2!1sth!2sth"
                  className="w-full"
                  height="150"
                  style={{ border: "2px solid #dfdfdf", borderRadius: "18px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

              </div>
            </div>
            <div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{t("welcome.contact")}</h3>
              <div className="flex space-x-4">
                <a href="https://maps.app.goo.gl/SUTe631uLxX4DD3QA" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary">
                  <p className="text-muted-foreground">100 หนองปากโลง</p>
                  <p className="text-muted-foreground">อำเภอเมืองนครปฐม นครปฐม 73000</p>
                  <p className="text-muted-foreground">{t("welcome.phone")}: 06-5329-9452</p>
                  <p className="text-muted-foreground">Line : IDLine</p>
                  <p className="text-muted-foreground"><a href="https://www.facebook.com/poll.ponlop.5/">{t("welcome.facebook")}: Poll Ponlop</a></p>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {t("app.title")}. {t("footer.rights")}.
            </p>
          </div>
        </div>      </footer>      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          style={{ backgroundColor: '#FF6600' }}
          className="fixed bottom-8 right-8 text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none z-50"
          aria-label="Back to top"
        >
          <ArrowUpCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
