import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  Cell,
  LabelList,
  XAxis,
  YAxis,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import {
  Home,
  Wallet,
  BarChart3,
  Megaphone,
  Trophy,
  SlidersHorizontal,
  X,
  Clock,
  CheckCircle,
  Link2,
  Copy,
  RotateCcw,
  MousePointerClick,
  Plus,
  Download,
  UserPlus,
  CreditCard,
  Plug,
  Target,
  BookOpen,
  Smartphone,
  Trash2,
  Globe,
  Map as MapIcon,
  Zap,
  ShieldCheck,
  User,
  Users,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import logo from "./assets/logo.png";

const apiFetch = async (url, options = {}) => {
  const headers = { ...(options.headers || {}) };
  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem("dash-auth") || "null");
      if (stored?.token && !headers.Authorization) {
        headers.Authorization = `Bearer ${stored.token}`;
      }
    } catch (error) {
      // ignore storage issues
    }
  }
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:invalid"));
  }
  return response;
};

const navItems = [
  { key: "home", label: "Home", icon: Home },
  { key: "geos", label: "GEOS", icon: MapIcon },
  { key: "streams", label: "Goals", icon: Target },
  { key: "finances", label: "Finances", icon: Wallet },
  { key: "utm", label: "UTM Builder", icon: Link2 },
  { key: "statistics", label: "Statistics", icon: BarChart3 },
  { key: "campaigns", label: "Campaigns", icon: Megaphone },
  { key: "placements", label: "Placement", icon: MousePointerClick },
  { key: "user_behavior", label: "User Behavior", icon: Users },
  { key: "devices", label: "Devices", icon: Smartphone },
  { key: "domains", label: "Domains", icon: Globe },
  { key: "pixels", label: "Pixels", icon: Zap },
  { key: "roles", label: "Roles", icon: ShieldCheck },
  { key: "profile", label: "Profile", icon: User },
  { key: "api", label: "API", icon: Plug },
  {
    key: "segmentation",
    label: "Segmentation",
    icon: MousePointerClick,
    href: "https://visionary-fox-61c06d.netlify.app/",
  },
  {
    key: "calculator",
    label: "Calculator",
    icon: SlidersHorizontal,
    href: "https://mellow-medovik-a46551.netlify.app/",
  },
];

const navSections = [
  { title: "Overview", items: ["home", "geos", "streams"] },
  { title: "Performance", items: ["statistics", "campaigns", "placements", "user_behavior", "devices"] },
  { title: "Operations", items: ["finances", "utm", "domains", "pixels"] },
  { title: "Administration", items: ["roles"] },
  { title: "Account", items: ["profile"] },
  { title: "Integrations", items: ["api"] },
  { title: "Tools", items: ["segmentation", "calculator"] },
];

const countryOptions = [
  "Argentina",
  "Australia",
  "Azerbaijan",
  "Albania",
  "Algeria",
  "Bolivia",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Ecuador",
  "Egypt",
  "Estonia",
  "France",
  "Germany",
  "Guyana",
  "India",
  "Iran",
  "Iraq",
  "Japan",
  "Morocco",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Paraguay",
  "Peru",
  "Poland",
  "Romania",
  "Russia",
  "South Korea",
  "Sweden",
  "Switzerland",
  "Tunisia",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United States",
  "Venezuela",
  "Vietnam",
];

const categoryOptions = ["Traffic Source", "Tools", "Designs"];
const billingOptions = ["Crypto", "Bank Transfer", "Card"];
const statusOptions = ["Requested", "Done", "Expired", "Cancelled"];
const approachOptions = ["All", "Organic", "Paid Social", "Influencers", "Search"];
const priorityBuyers = [
  "Leo",
  "Leticia",
  "Carvalho",
  "Akku",
  "Enzo",
  "Matheus",
  "Sara",
  "ZM apps",
];
const buyerOptions = ["All", ...priorityBuyers];
const roleOptions = [
  "Boss",
  "Team Leader",
  "Media Buyer Junior",
  "Media Buyer",
  "Media Buyer Senior",
];

const permissionOptions = [
  { key: "dashboard", label: "Home Dashboard" },
  { key: "geos", label: "GEOS" },
  { key: "goals", label: "Goals" },
  { key: "finances", label: "Finances" },
  { key: "utm", label: "UTM Builder" },
  { key: "statistics", label: "Statistics" },
  { key: "campaigns", label: "Campaigns" },
  { key: "placements", label: "Placement" },
  { key: "user_behavior", label: "User Behavior" },
  { key: "devices", label: "Devices" },
  { key: "domains", label: "Domains" },
  { key: "pixels", label: "Pixels" },
  { key: "api", label: "API" },
  { key: "media_buyers", label: "Media Buyers" },
  { key: "roles", label: "Roles & Permissions" },
];

const periodOptions = [
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
  "All",
];

const FlagEN = () => (
  <svg viewBox="0 0 36 36" aria-hidden="true">
    <rect width="36" height="36" fill="#012169" rx="6" />
    <path
      d="M0 0 36 36 M36 0 0 36"
      stroke="#FFF"
      strokeWidth="6"
      strokeLinecap="square"
    />
    <path
      d="M0 0 36 36 M36 0 0 36"
      stroke="#C8102E"
      strokeWidth="3"
      strokeLinecap="square"
    />
    <path d="M18 0v36M0 18h36" stroke="#FFF" strokeWidth="10" />
    <path d="M18 0v36M0 18h36" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

const FlagTR = () => (
  <svg viewBox="0 0 36 36" aria-hidden="true">
    <rect width="36" height="36" fill="#E30A17" rx="6" />
    <circle cx="15" cy="18" r="8" fill="#FFF" />
    <circle cx="17.5" cy="18" r="6.5" fill="#E30A17" />
    <path
      d="M24.5 18l3.8 1.2-2.3 3.2 0.1-4-3.4-2.1 3.9-0.3-0.8-3.9 2.2 3.3 3.6-1.8-2.6 3 2.9 2.7z"
      fill="#FFF"
    />
  </svg>
);

const AndroidIcon = ({ size = 18, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    aria-hidden="true"
    className={className}
    style={style}
  >
    <rect x="12" y="24" width="40" height="26" rx="8" fill="currentColor" />
    <rect x="16" y="10" width="32" height="16" rx="8" fill="currentColor" />
    <rect x="4" y="24" width="8" height="24" rx="4" fill="currentColor" />
    <rect x="52" y="24" width="8" height="24" rx="4" fill="currentColor" />
    <rect x="20" y="50" width="8" height="10" rx="4" fill="currentColor" />
    <rect x="36" y="50" width="8" height="10" rx="4" fill="currentColor" />
    <circle cx="24" cy="20" r="2" fill="#0b0f0c" />
    <circle cx="40" cy="20" r="2" fill="#0b0f0c" />
    <path d="M20 6 L12 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M44 6 L52 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const AppleIcon = ({ size = 18, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    aria-hidden="true"
    className={className}
    style={style}
  >
    <path
      fill="currentColor"
      d="M44.2 34.4c0 8.1-5.6 15.6-11.4 15.6-2.6 0-3.8-1.4-6.8-1.4-3.1 0-4.5 1.4-6.9 1.4-5.3 0-11.4-6.5-11.4-14.8 0-5.8 3.6-10.9 9-10.9 2.8 0 5.1 1.5 6.8 1.5 1.7 0 4.4-1.7 7.2-1.7 1.3 0 5.4.2 8.3 4.1-.2.1-4.9 2.6-4.9 8.4 0 6.5 5.7 8.4 7.1 8.8z"
    />
    <path
      fill="currentColor"
      d="M38.8 11.8c-1.4 1.8-3.9 3.3-6.2 3.1-.3-2.3.8-4.6 2.2-6.3 1.5-1.7 4-3 6.3-3.1.2 2.3-.7 4.7-2.3 6.3z"
    />
  </svg>
);

const WindowsIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="8" height="8" fill="currentColor" />
    <rect x="13" y="3" width="8" height="8" fill="currentColor" />
    <rect x="3" y="13" width="8" height="8" fill="currentColor" />
    <rect x="13" y="13" width="8" height="8" fill="currentColor" />
  </svg>
);

const LinuxIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <rect x="7" y="12" width="10" height="8" rx="4" fill="currentColor" />
    <circle cx="10" cy="7.5" r="0.8" fill="#0b0f0c" />
    <circle cx="14" cy="7.5" r="0.8" fill="#0b0f0c" />
  </svg>
);

const ChromeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

const DesktopIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="2" fill="currentColor" />
    <rect x="9" y="18" width="6" height="2" fill="currentColor" />
  </svg>
);

const MobileIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="7" y="3" width="10" height="18" rx="2" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="#0b0f0c" />
  </svg>
);

const TabletIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="3" width="14" height="18" rx="2" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="#0b0f0c" />
  </svg>
);

const UnknownIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="currentColor" />
    <path
      d="M12 7c-1.6 0-2.6.9-2.6 2.2h1.8c.1-.5.4-.8.9-.8.6 0 1 .4 1 1 0 .7-.6 1-1.3 1.4-.8.4-1.3.9-1.3 2v.4h1.8v-.3c0-.6.4-.8 1-.9.8-.2 1.8-.7 1.8-2.4 0-1.7-1.3-2.6-3.1-2.6zm-.9 8.5c0 .6.5 1.1 1.1 1.1s1.1-.5 1.1-1.1-.5-1.1-1.1-1.1-1.1.5-1.1 1.1z"
      fill="#0b0f0c"
    />
  </svg>
);

const getOsIconComponent = (value) => {
  const label = String(value || "").toLowerCase();
  if (label.includes("android")) return AndroidIcon;
  if (label.includes("ios") || label.includes("iphone") || label.includes("ipad") || label.includes("mac")) return AppleIcon;
  if (label.includes("windows")) return WindowsIcon;
  if (label.includes("linux")) return LinuxIcon;
  if (label.includes("chrome")) return ChromeIcon;
  if (label.includes("tablet")) return TabletIcon;
  if (label.includes("mobile") || label.includes("phone")) return MobileIcon;
  if (label.includes("desktop")) return DesktopIcon;
  return UnknownIcon;
};

const getOsAccent = (value) => {
  const label = String(value || "").toLowerCase();
  if (label.includes("android")) return "#A4C639";
  if (label.includes("ios") || label.includes("iphone") || label.includes("ipad") || label.includes("mac"))
    return "#E3E3E3";
  if (label.includes("windows")) return "#00A4EF";
  if (label.includes("linux")) return "#F5C451";
  if (label.includes("chrome")) return "#E84D2D";
  if (label.includes("tablet")) return "#8AA4FF";
  if (label.includes("mobile") || label.includes("phone")) return "#7ED957";
  if (label.includes("desktop")) return "#9AA0A6";
  return "#B0B3B8";
};

const languageOptions = [
  { code: "EN", label: "English", Flag: FlagEN },
  { code: "TR", label: "Türkçe", Flag: FlagTR },
];

const translations = {
  tr: {
    Home: "Ana Sayfa",
    Goals: "Hedefler",
    Finances: "Finanslar",
    "UTM Builder": "UTM Oluşturucu",
    Statistics: "İstatistikler",
    Domains: "Alan Adları",
    API: "API",
    Profile: "Profil",
    Tools: "Araçlar",
    Segmentation: "Segmentasyon",
    Calculator: "Hesaplayıcı",
    Overview: "Genel Bakış",
    Performance: "Performans",
    Operations: "Operasyonlar",
    Administration: "Yönetim",
    Account: "Hesap",
    Integrations: "Entegrasyonlar",
    Filters: "Filtreler",
    "Media Buyer": "Medya Alıcısı",
    "Media Buyer Directory": "Medya Alıcısı Dizini",
    "Identify your team members and keep contact details organized.":
      "Ekip üyelerinizi tanımlayın ve iletişim bilgilerini düzenli tutun.",
    "Media buyer management is restricted to leadership.":
      "Medya alıcısı yönetimi yalnızca liderlik tarafından yapılabilir.",
    "Full name": "Tam isim",
    "e.g. Crash, Roulette": "örn. Crash, Rulet",
    "Goal Setup": "Hedef Tanımı",
    "Define the target outcomes your media buyers must reach.":
      "Medya alıcılarınızın ulaşması gereken hedefleri tanımlayın.",
    "Goal Scope": "Hedef Kapsamı",
    "Global Goal": "Global Hedef",
    "All Buyers": "Tüm Alıcılar",
    "Your Progress": "Sizin İlerlemeniz",
    "Based on your metrics": "Kendi metriklerinize göre",
    "Goals Assigned": "Atanan Hedefler",
    "Your goals are managed by leadership. Track progress below.":
      "Hedefleriniz yönetim tarafından belirlenir. Aşağıdan ilerlemenizi takip edin.",
    "No goal setup access for your role.": "Rolünüz hedef oluşturma yetkisine sahip değil.",
    "Achieved Targets": "Başarılan Hedefler",
    "Unachieved Targets": "Tamamlanmayan Hedefler",
    "Profile Details": "Profil Detayları",
    "Account Overview": "Hesap Özeti",
    "Access Level": "Erişim Seviyesi",
    "Assigned Media Buyer": "Atanan Medya Alıcısı",
    "Account Status": "Hesap Durumu",
    "Loading profile…": "Profil yükleniyor…",
    "User ID": "Kullanıcı ID",
    "Buyer ID": "Alıcı ID",
    "No buyer linked": "Bağlı alıcı yok",
    Verified: "Doğrulandı",
    Unverified: "Doğrulanmadı",
    "Role Permissions": "Rol Yetkileri",
    "Permissions granted by your role.": "Rolünüz tarafından verilen yetkiler.",
    "No permissions assigned.": "Yetki atanmadı.",
    "Goals Overview": "Hedef Özeti",
    "Track progress vs. targets using live statistics data.":
      "Canlı istatistik verileriyle hedeflere karşı ilerlemeyi izleyin.",
    "Domains Registry": "Alan Adı Kaydı",
    "Track every domain in use and keep its status updated.":
      "Kullanımdaki tüm alan adlarını takip edin ve durumunu güncel tutun.",
    Domain: "Alan Adı",
    Game: "Oyun",
    Owner: "Sahip",
    Platform: "Platform",
    "PWA Group": "PWA Grup",
    "Link Group": "Link Grup",
    "ZM apps": "ZM uygulamaları",
    "Keitaro Connection": "Keitaro Bağlantısı",
    "Connect your tracker and validate the Admin API key.":
      "Takip sisteminizi bağlayın ve Admin API anahtarını doğrulayın.",
    "Step 1": "Adım 1",
    "Step 2": "Adım 2",
    "Step 3": "Adım 3",
    "Connection checklist": "Bağlantı kontrol listesi",
    "Base URL, API key, and report endpoint are required before syncing.":
      "Senkronizasyondan önce Temel URL, API anahtarı ve rapor uç noktası gereklidir.",
    "Report Sync": "Rapor Senkronizasyonu",
    "Paste a Keitaro report payload and map fields into your statistics table.":
      "Keitaro rapor yükünü yapıştırın ve alanları istatistik tablonuza eşleyin.",
    "Required parameters": "Gerekli parametreler",
    "Provide click_id or campaign_id for attribution.":
      "Eşleştirme için click_id veya campaign_id sağlayın.",
    "Optional parameters": "İsteğe bağlı parametreler",
    "external_id, country, buyer, domain, device, status, payout.":
      "external_id, country, buyer, domain, device, status, payout.",
    "Postback Logs": "Postback Kayıtları",
    "Latest events received from postbacks.":
      "Postback üzerinden alınan en son olaylar.",
    Refresh: "Yenile",
    "Refreshing...": "Yenileniyor...",
    "No postback logs yet.": "Henüz postback kaydı yok.",
    "See More": "Daha Fazla",
    "Show Less": "Daha Az Göster",
    "Add comment": "Yorum ekle",
    "Pixel Comment": "Piksel Yorumu",
    "Change Password": "Şifreyi Değiştir",
    "Current Password": "Mevcut Şifre",
    "New Password": "Yeni Şifre",
    "Confirm Password": "Şifreyi Onayla",
    "Update Password": "Şifreyi Güncelle",
    "Password updated.": "Şifre güncellendi.",
    "Passwords do not match.": "Şifreler eşleşmiyor.",
    "Reset Password": "Şifreyi Sıfırla",
    "Password is required.": "Şifre gerekli.",
    "Session expired. Please sign in again.": "Oturum süresi doldu. Lütfen yeniden giriş yapın.",
    Time: "Zaman",
    Event: "Olay",
    Campaign: "Kampanya",
    "Click ID": "Click ID",
    "External ID": "External ID",
    Source: "Kaynak",
    "Report Payload (JSON)": "Rapor Yükü (JSON)",
    "Field Mapping": "Alan Eşlemesi",
    "Map Keitaro fields to dashboard columns.":
      "Keitaro alanlarını panel sütunlarına eşleyin.",
    "Hide Mapping": "Eşlemeyi Gizle",
    "Show Mapping": "Eşlemeyi Göster",
    "Mapping hidden. Click show to edit fields.":
      "Eşleme gizli. Alanları düzenlemek için göster'e tıklayın.",
    "Identity Fields": "Kimlik Alanları",
    "Geo Fields": "Coğrafi Alanlar",
    "Performance Fields": "Performans Alanları",
    "Event Fields": "Etkinlik Alanları",
    "Device Fields": "Cihaz Alanları",
    "Replace existing entries for the same date + buyer + country":
      "Aynı tarih + alıcı + ülke için mevcut kayıtları değiştir",
    "Test Connection": "Bağlantıyı Test Et",
    "Testing...": "Test ediliyor...",
    "Sync Now": "Şimdi Senkronize Et",
    "Syncing...": "Senkronize ediliyor...",
    "Load Example": "Örneği Yükle",
    "Load Overall Example": "Genel Örneği Yükle",
    "Load Device Example": "Cihaz Örneğini Yükle",
    "Connection verified.": "Bağlantı doğrulandı.",
    "Sync complete.": "Senkronizasyon tamamlandı.",
    "Report payload must be valid JSON.": "Rapor yükü geçerli JSON olmalıdır.",
    "Imported {inserted} rows, skipped {skipped} of {total}":
      "{inserted} satır içe aktarıldı, {total} satırın {skipped} tanesi atlandı",
    "Base URL": "Temel URL",
    "API Key": "API Anahtarı",
    "Report Endpoint": "Rapor Uç Noktası",
    "Default Keitaro report endpoint.": "Varsayılan Keitaro rapor uç noktası.",
    "Remember API key locally": "API anahtarını yerelde sakla",
    "Stored only in your browser.": "Sadece tarayıcınızda saklanır.",
    "Tip: open a Keitaro report, copy the request payload from your browser network tab, and paste it here.":
      "İpucu: Bir Keitaro raporu açın, tarayıcınızın ağ sekmesinden istek yükünü kopyalayın ve buraya yapıştırın.",
    "Date Field": "Tarih Alanı",
    "Buyer Field": "Alıcı Alanı",
    "Country Field": "Ülke Alanı",
    "Spend Field": "Harcama Alanı",
    "Clicks Field": "Tıklama Alanı",
    "Installs Field": "Kurulum Alanı",
    "Registers Field": "Kayıt Alanı",
    "FTDs Field": "FTD Alanı",
    "Redeposits Field": "Redepozit Alanı",
    "FTD Revenue Field": "FTD Gelir Alanı",
    "Redeposit Revenue Field": "Redepozit Gelir Alanı",
    "OS Field": "OS Alanı",
    "OS Version Field": "OS Sürümü Alanı",
    "OS Icon Field": "OS İkon Alanı",
    "Device Model Field": "Cihaz Modeli Alanı",
    OS: "OS",
    "OS Version": "OS Sürümü",
    "Device Model": "Cihaz Modeli",
    Name: "İsim",
    Role: "Rol",
    Country: "Ülke",
    Approach: "Yaklaşım",
    Game: "Oyun",
    Email: "E-posta",
    Contact: "İletişim",
    Status: "Durum",
    "Date Range": "Tarih Aralığı",
    Period: "Dönem",
    Notes: "Notlar",
    "FTDs Target": "FTD Hedefi",
    "Reg2Dep Target (%)": "Reg2Dep Hedefi (%)",
    "Add Goal": "Hedef Ekle",
    "Add Member": "Üye Ekle",
    "Add Domain": "Alan Adı Ekle",
    Reset: "Sıfırla",
    "Manual Entry": "Manuel Giriş",
    "Track expenses by date, country, category, and billing type.":
      "Giderleri tarih, ülke, kategori ve faturalandırma türüne göre takip edin.",
    Date: "Tarih",
    Category: "Kategori",
    Reference: "Referans",
    "Tool, vendor, or invoice reference": "Araç, tedarikçi veya fatura referansı",
    "Billing type": "Faturalandırma türü",
    "Amount (USD)": "Tutar (USD)",
    Clear: "Temizle",
    "Save Entry": "Kaydı Kaydet",
    "Expense Log": "Gider Günlüğü",
    "Latest manual entries saved in the database.": "Veritabanına kaydedilen son manuel girişler.",
    "No entries yet. Add your first expense above.": "Henüz kayıt yok. İlk giderinizi yukarıdan ekleyin.",
    "Loading entries…": "Kayıtlar yükleniyor…",
    "Loading media stats…": "Medya istatistikleri yükleniyor…",
    "Monthly Expenses": "Aylık Giderler",
    "Total spend": "Toplam Harcama",
    "Average / month": "Aylık Ortalama",
    "Category Breakdown": "Kategori Dağılımı",
    "Spend distribution across categories.": "Kategorilere göre harcama dağılımı.",
    "Billing Type Mix": "Ödeme Türü Dağılımı",
    "Share of spend by payment method.": "Ödeme yöntemine göre harcama payı.",
    "Total Expenses": "Toplam Giderler",
    "All time": "Tüm zamanlar",
    "Current month": "Cari ay",
    "Pending Requests": "Bekleyen Talepler",
    "Awaiting approval": "Onay bekliyor",
    Completed: "Tamamlandı",
    "Marked done": "Tamamlandı olarak işaretlendi",
    "Last 7 days": "Son 7 gün",
    "Conversion rate": "Dönüşüm oranı",
    "Daily conversion rates": "Günlük dönüşüm oranları",
    "Spend by date": "Tarihe Göre Harcama",
    "Daily spend trend for the selected period.": "Seçilen dönemdeki günlük harcama trendi.",
    "Spend per FTD": "FTD Başına Harcama",
    "Spend per Redeposit": "Redepozit Başına Harcama",
    "Total Spend": "Toplam Harcama",
    "Revenue by date": "Tarihe Göre Gelir",
    "Daily revenue trend for the selected period.": "Seçilen dönemdeki günlük gelir trendi.",
    "Revenue per FTD": "FTD Başına Gelir",
    "Revenue per Redeposit": "Redepozit Başına Gelir",
    "FTD Revenue": "FTD Geliri",
    "Redeposit Revenue": "Redepozit Geliri",
    "FTD to Redeposit CR": "FTD → Redepozit Dönüşümü",
    "Above avg": "Ortalamanın Üstü",
    "Below avg": "Ortalamanın Altı",
    "On target": "Hedefte",
    "No benchmark": "Kıyas yok",
    "Tip: hover or click legends to isolate a series.":
      "İpucu: Bir seriyi izole etmek için lejantın üzerine gelin veya tıklayın.",
    "Top GEO": "En İyi GEO",
    "Highest FTD conversion rate and Reg2Dep conversion rate":
      "En yüksek FTD dönüşüm oranı ve Reg2Dep dönüşüm oranı",
    GEOS: "GEO",
    "GEO Report": "GEO Raporu",
    "Performance by country for the selected filters.":
      "Seçilen filtrelere göre ülke performansı.",
    "Loading geo report…": "GEO raporu yükleniyor…",
    "No geo data yet.": "Henüz GEO verisi yok.",
    "See more": "Daha fazla gör",
    Spend: "Harcama",
    Redeposits: "Redepozitler",
    ARPPU: "ARPPU",
    LTV: "LTV",
    "Metric:": "Metrik:",
    "FTD rate + Reg2Dep rate": "FTD oranı + Reg2Dep oranı",
    "Active GEO:": "Aktif GEO:",
    None: "Yok",
    "Conversion Funnel": "Dönüşüm Hunisi",
    "Stage counts for the selected period": "Seçilen dönem için aşama sayıları",
    "Conversion Rates": "Dönüşüm Oranları",
    "Average rate across each handoff": "Her geçişteki ortalama oran",
    "Avg rate": "Ort. oran",
    Value: "Değer",
    Rate: "Oran",
    Share: "Pay",
    "Custom range": "Özel aralık",
    Cancel: "İptal",
    Apply: "Uygula",
    to: "ile",
    Today: "Bugün",
    Yesterday: "Dün",
    "This Week": "Bu Hafta",
    "Last Week": "Geçen Hafta",
    "This Month": "Bu Ay",
    "Last Month": "Geçen Ay",
    All: "Tümü",
    Daily: "Günlük",
    Weekly: "Haftalık",
    Monthly: "Aylık",
    Custom: "Özel",
    "Pending": "Beklemede",
    "Paused": "Duraklatıldı",
    "Expired": "Süresi Doldu",
    "Blocked": "Engellendi",
    "Active": "Aktif",
    "Onboarding": "Oryantasyon",
    "Inactive": "Pasif",
    "Loading goals…": "Hedefler yükleniyor…",
    "No goals set yet.": "Henüz hedef belirlenmedi.",
    "No targets": "Hedef yok",
    Achieved: "Başarıldı",
    "On track": "Yolunda",
    Behind: "Geride",
    "All Countries": "Tüm Ülkeler",
    Progress: "İlerleme",
    FTDs: "FTD'ler",
    "Loading team…": "Ekip yükleniyor…",
    "No media buyers added yet.": "Henüz medya alıcısı eklenmedi.",
    "Loading domains…": "Alan adları yükleniyor…",
    "No domains added yet.": "Henüz alan adı eklenmedi.",
    Domain: "Alan Adı",
    "Home Dashboard": "Ana Gösterge Paneli",
    "Roles & Permissions": "Roller ve Yetkiler",
    Roles: "Roller",
    "Media Buyers": "Medya Alıcıları",
    "Define what each role can access and edit.": "Her rolün neleri görebileceğini ve düzenleyebileceğini tanımlayın.",
    "Create Role": "Rol Oluştur",
    "Role Name": "Rol Adı",
    "Add Role": "Rol Ekle",
    Permissions: "Yetkiler",
    "Save Changes": "Değişiklikleri Kaydet",
    "Saving...": "Kaydediliyor...",
    "Loading roles…": "Roller yükleniyor…",
    "No roles found.": "Rol bulunamadı.",
    "Loading users…": "Kullanıcılar yükleniyor…",
    "No users found.": "Kullanıcı bulunamadı.",
    "User Access": "Kullanıcı Erişimi",
    "Create Login": "Giriş Oluştur",
    Username: "Kullanıcı adı",
    Password: "Parola",
    "Assign Media Buyer": "Medya Alıcısı Ata",
    "User Accounts": "Kullanıcı Hesapları",
    "Logged Media Buyer": "Giriş yapan medya alıcısı",
    "Logged as {role}": "Giriş yapan: {role}",
    Documentation: "Dokümantasyon",
    "System Documentation": "Sistem Dokümantasyonu",
    "Everything you need to operate the dashboard, manage data, and onboard media buyers.":
      "Paneli yönetmek, verileri yönetmek ve medya alıcılarını sisteme dahil etmek için gereken her şey.",
    Sections: "Bölümler",
    Data: "Veri",
    Access: "Erişim",
    "Local SQLite": "Yerel SQLite",
    "Role-based": "Role dayalı",
    "Getting Started": "Başlangıç",
    "Use your assigned username and password to sign in. Your role controls what you can view and edit.":
      "Size atanan kullanıcı adı ve parolayla giriş yapın. Rolünüz, neleri görebileceğinizi ve düzenleyebileceğinizi belirler.",
    "Use the sidebar to navigate modules.": "Modüller arasında gezinmek için kenar çubuğunu kullanın.",
    "Use the language switcher at the bottom to toggle EN / TR.":
      "Alttaki dil değiştiriciyle EN / TR arasında geçiş yapın.",
    "Your profile in the top right shows the active user and role.":
      "Sağ üstteki profil, aktif kullanıcıyı ve rolü gösterir.",
    "Quick overview of clicks, installs, registers, FTDs, and conversion rates.":
      "Tıklamalar, kurulumlar, kayıtlar, FTD'ler ve dönüşüm oranlarının hızlı özeti.",
    "Use the period selector for time ranges.": "Zaman aralıkları için dönem seçiciyi kullanın.",
    "Charts show conversion rates and top GEO distribution.":
      "Grafikler dönüşüm oranlarını ve en iyi GEO dağılımını gösterir.",
    "Filters apply to Home and Finances.": "Filtreler Ana Sayfa ve Finanslar için geçerlidir.",
    "Set targets for FTDs and Reg2Dep conversion by media buyer, country, and period.":
      "Medya alıcısı, ülke ve döneme göre FTD ve Reg2Dep dönüşüm hedefleri belirleyin.",
    "Define period or custom date range.": "Dönem ya da özel tarih aralığı tanımlayın.",
    "Goal overview banner summarizes progress.": "Hedef özet bandı ilerlemeyi özetler.",
    "Track status: achieved, on track, or behind.": "Durumu takip edin: başarıldı, yolunda veya geride.",
    "Manual expense entry with billing type and status. Charts update automatically.":
      "Ödeme türü ve durumuyla manuel gider girişi. Grafikler otomatik güncellenir.",
    "Fields: date, country, category, reference, billing type, amount, status.":
      "Alanlar: tarih, ülke, kategori, referans, ödeme türü, tutar, durum.",
    "Totals and averages refresh on save.": "Toplamlar ve ortalamalar kaydettiğinizde yenilenir.",
    "Monthly and category charts visualize spend.": "Aylık ve kategori grafikleri harcamayı görselleştirir.",
    "Enter daily performance per media buyer and country; the system calculates funnel and cost metrics.":
      "Medya alıcısı ve ülkeye göre günlük performans girin; sistem huni ve maliyet metriklerini hesaplar.",
    "Inputs: date, spend, clicks, installs, registers, FTDs, country.":
      "Girdiler: tarih, harcama, tıklamalar, kurulumlar, kayıtlar, FTD'ler, ülke.",
    "Derived metrics: Click2Install, Click2Register, Install2Reg, Reg2Dep.":
      "Türetilen metrikler: Click2Install, Click2Register, Install2Reg, Reg2Dep.",
    "Cost metrics: CPC, CPI, CPR, CPP.": "Maliyet metrikleri: CPC, CPI, CPR, CPP.",
    "Generate tracking links with fbp and sub1-sub15 parameters.":
      "fbp ve sub1-sub15 parametreleriyle takip linkleri oluşturun.",
    "Enter the base domain.": "Temel alan adını girin.",
    "Fill fbp and any sub fields you need.": "fbp ve ihtiyaç duyduğunuz sub alanlarını doldurun.",
    "Only filled parameters are added to the final URL.":
      "Sadece doldurulan parametreler nihai URL'ye eklenir.",
    "Keep a registry of your landing domains and status.":
      "Landing alan adlarınız ve durumları için bir kayıt tutun.",
    "Add domains with status and notes.": "Durum ve notlarla alan adı ekleyin.",
    "Use statuses to track availability.": "Durumları kullanılabilirliği takip etmek için kullanın.",
    "Domains list shows the latest entries.": "Alan adları listesi en son girişleri gösterir.",
    "Roles & Users": "Roller ve Kullanıcılar",
    "Manage roles, permissions, and verified user access.":
      "Rolleri, yetkileri ve doğrulanmış kullanıcı erişimini yönetin.",
    "Create roles and toggle permissions.": "Roller oluşturun ve yetkileri açıp kapayın.",
    "Assign roles when creating users.": "Kullanıcı oluştururken rol atayın.",
    "Verified users can access the platform.": "Doğrulanmış kullanıcılar platforma erişebilir.",
    "Connect Keitaro to pull performance data automatically.":
      "Performans verilerini otomatik çekmek için Keitaro'ya bağlanın.",
    "Configure endpoint, API key, and payload mapping.":
      "Uç nokta, API anahtarı ve payload eşlemesini yapılandırın.",
    "Keitaro syncs registrations, FTDs, and redeposits. Installs come via postback.":
      "Keitaro kayıtları, FTD'leri ve redepozitleri senkronize eder. Kurulumlar postback ile gelir.",
    "Use Sync to fetch data.": "Veri çekmek için Senkronize'yi kullanın.",
    "Status panel shows last sync.": "Durum paneli son senkronu gösterir.",
    "Best Practices": "En İyi Uygulamalar",
    "Keep entries consistent by date and country.":
      "Girişleri tarih ve ülkeye göre tutarlı tutun.",
    "Review goals weekly and adjust caps.": "Hedefleri haftalık gözden geçirip limitleri ayarlayın.",
    "Use UTM templates per buyer to avoid mistakes.":
      "Hata önlemek için alıcı başına UTM şablonları kullanın.",
    Devices: "Cihazlar",
    "Sync Target": "Senkron Hedefi",
    "Overall Stats": "Genel İstatistikler",
    "Device Stats": "Cihaz İstatistikleri",
    "Choose where the report data should be stored.":
      "Rapor verisinin nereye kaydedileceğini seçin.",
    "Revenue Field": "Gelir Alanı",
    "Device Field": "Cihaz Alanı",
    "Total Revenue": "Toplam Gelir",
    "Total Installs": "Toplam Kurulum",
    "Avg CR": "Ort. Dönüşüm",
    "Device view": "Cihaz görünümü",
    "FTD / Clicks": "FTD / Tıklamalar",
    "Top OS": "En İyi OS",
    "Top OS Version": "En İyi OS Sürümü",
    "Top OS Installs": "En İyi OS Kurulum",
    "Top OS CR": "En İyi OS Dönüşüm",
    "No data": "Veri yok",
    "Revenue by OS": "OS'a Göre Gelir",
    "Click by OS": "OS'a Göre Tıklama",
    "Install By OS": "OS'a Göre Kurulum",
    "CR by OS": "OS'a Göre Dönüşüm Oranı",
    "Track revenue contribution by OS.":
      "OS'a göre gelir katkısını takip edin.",
    "Clicks volume grouped by OS.": "OS'a göre gruplanmış tıklama hacmi.",
    "Install postbacks grouped by OS.": "OS'a göre gruplanmış kurulum postback'leri.",
    "FTD conversion rate by OS.": "OS'a göre FTD dönüşüm oranı.",
    "Device Breakdown": "Cihaz Dağılımı",
    "Clicks, installs, revenue, and CR by device.":
      "Cihaza göre tıklamalar, kurulumlar, gelir ve dönüşüm oranı.",
    "Loading device stats…": "Cihaz istatistikleri yükleniyor…",
    "No device data available yet.": "Henüz cihaz verisi yok.",
    "Conversion Rate": "Dönüşüm Oranı",
    Revenue: "Gelir",
    Device: "Cihaz",
    "Analyze device performance for clicks, installs, revenue, and CR.":
      "Cihaza göre tıklama, kurulum, gelir ve dönüşüm oranını analiz edin.",
    "Sync device reports from Keitaro.": "Keitaro'dan cihaz raporlarını senkronize edin.",
    "Installs come from your postback receiver.": "Kurulumlar postback alıcınızdan gelir.",
    "Compare revenue and conversion rates per device.":
      "Cihaz başına gelir ve dönüşüm oranlarını karşılaştırın.",
    "Install Postback Receiver": "Kurulum Postback Alıcısı",
    "FTD Postback Receiver": "FTD Postback Alıcısı",
    "Redeposit Postback Receiver": "Yeniden Yatırım Postback Alıcısı",
    "Receive install events from your traffic source and attach them to Keitaro campaigns.":
      "Trafik kaynağınızdan gelen kurulum eventlerini alın ve Keitaro kampanyalarına bağlayın.",
    "Receive FTD events from your traffic source and attach them to Keitaro campaigns.":
      "Trafik kaynağınızdan gelen FTD eventlerini alın ve Keitaro kampanyalarına bağlayın.",
    "Receive redeposit events from your traffic source and attach them to Keitaro campaigns.":
      "Trafik kaynağınızdan gelen yeniden yatırım eventlerini alın ve Keitaro kampanyalarına bağlayın.",
    "Postback URL": "Postback URL",
    "Copy URL": "URL Kopyala",
    "Copied successfully": "Başarıyla kopyalandı",
    "Has been copied successfully": "Başarıyla kopyalandı",
    "Copy failed": "Kopyalama başarısız",
    "Accepted parameters": "Kabul edilen parametreler",
    "campaign_id - Keitaro campaign ID or name": "campaign_id - Keitaro kampanya ID veya adı",
    "buyer - media buyer override": "buyer - medya alıcısı geçersiz kılma",
    "country - ISO2/ISO3 code": "country - ISO2/ISO3 kodu",
    "domain - landing domain override": "domain - landing alan adı geçersiz kılma",
    "device - OS or device type (Android, iOS, Desktop)":
      "device - OS veya cihaz türü (Android, iOS, Masaüstü)",
    "Device values are normalized to match Keitaro (Android, iOS, Windows, macOS, Linux).":
      "Cihaz değerleri Keitaro ile eşleşecek şekilde normalize edilir (Android, iOS, Windows, macOS, Linux).",
    "click_id / subid - click identifier": "click_id / subid - tıklama kimliği",
    "date / timestamp - optional": "date / timestamp - isteğe bağlı",
    "key - required if POSTBACK_SECRET is set":
      "key - POSTBACK_SECRET ayarlandıysa gerekli",
    "Example request": "Örnek istek",
    "Campaign Mapping": "Kampanya Eşleme",
    "Map Keitaro campaign IDs to media buyers for install attribution.":
      "Kurulum ataması için Keitaro kampanya ID'lerini medya alıcılarına eşleyin.",
    "Keitaro Campaign ID": "Keitaro Kampanya ID",
    "Campaign Name": "Kampanya Adı",
    "Add Campaign": "Kampanya Ekle",
    "No campaigns added yet.": "Henüz kampanya eklenmedi.",
    "Loading campaigns…": "Kampanyalar yükleniyor…",
    "Sign In": "Giriş Yap",
    "Invalid credentials.": "Geçersiz bilgiler.",
    "Username and password are required.": "Kullanıcı adı ve parola gerekli.",
    "Logging in...": "Giriş yapılıyor...",
    Logout: "Çıkış Yap",
    "Welcome back": "Tekrar hoş geldiniz",
    "Sign in to continue": "Devam etmek için giriş yapın",
    "Access for media buyers": "Medya alıcıları için erişim",
    "Use your assigned credentials to access dashboards, goals, and reporting.":
      "Panolar, hedefler ve raporlamaya erişmek için size atanan bilgileri kullanın.",
    "Role-based access": "Rol bazlı erişim",
    "Real-time KPIs": "Gerçek zamanlı KPI'lar",
    "Secure login": "Güvenli giriş",
    "Set FTD and Reg2Dep targets by buyer and country.":
      "Medya alıcısı ve ülkeye göre FTD ve Reg2Dep hedefleri belirleyin.",
    "Track monthly spend, billing types, and status.":
      "Aylık harcamaları, ödeme türlerini ve durumu takip edin.",
    "Review funnel performance with conversion rates.":
      "Dönüşüm oranlarıyla huni performansını inceleyin.",
    "Generate links with fbp + sub parameters.":
      "fbp ve sub parametreleriyle bağlantılar oluşturun.",
    "Access is managed by your team leader.": "Erişim, takım lideriniz tarafından yönetilir.",
    "Secure access": "Güvenli erişim",
    "Available roles": "Mevcut roller",
    "Remember me": "Beni hatırla",
    "Need help? Contact admin.": "Yardıma mı ihtiyacınız var? Yöneticinize başvurun.",
    "Show password": "Parolayı göster",
    "Hide password": "Parolayı gizle",
    Boss: "Patron",
    "Team Leader": "Takım Lideri",
    "Media Buyer Junior": "Medya Alıcısı Junior",
    "Media Buyer Senior": "Medya Alıcısı Senior",
    "Traffic Source": "Trafik Kaynağı",
    Tools: "Araçlar",
    Designs: "Tasarım",
    Crypto: "Kripto",
    "Bank Transfer": "Banka Havalesi",
    Card: "Kart",
    Requested: "Talep Edildi",
    Done: "Tamamlandı",
    Organic: "Organik",
    "Paid Social": "Ücretli Sosyal",
    Influencers: "Influencer'lar",
    Search: "Arama",
    Clicks: "Tıklamalar",
    Install: "Kurulum",
    Register: "Kayıt",
    FTD: "FTD",
    Click2Install: "Tıklama→Kurulum",
    Click2Register: "Tıklama→Kayıt",
    Install2Reg: "Kurulum→Kayıt",
    Reg2Dep: "Kayıt→Depozit",
    Combined: "Birleşik",
    "FTD rate": "FTD oranı",
    "Reg2Dep rate": "Reg2Dep oranı",
    "Top performers": "En iyi performans",
    "Active GEO": "Aktif GEO",
  },
};

const LanguageContext = React.createContext({
  language: "EN",
  t: (key, vars) => key,
});

const useLanguage = () => React.useContext(LanguageContext);

const defaultKeitaroOverallPayloadObject = {
  dimensions: ["day", "campaign", "country", "city", "sub_id_1", "source", "sub_id_3", "sub_id_4", "sub_id_5"],
  measures: [
    "clicks",
    "regs",
    "custom_conversion_8",
    "custom_conversion_7",
    "custom_conversion_8_revenue",
    "custom_conversion_7_revenue",
    "cost",
  ],
  range: { interval: "first_day_of_this_month", timezone: "Asia/Dubai" },
  filters: [
    {
      name: "campaign",
      operator: "MATCH_REGEXP",
      expression: "(Leo|Leticia|Carvalho|Akku|Enzo|Matheus|Sara|ZM ?apps|ZMAPPS)",
    },
  ],
  limit: 1000,
  offset: 0,
  sort: [],
  summary: true,
  extended: true,
};

const defaultKeitaroDevicePayloadObject = {
  dimensions: ["day", "campaign", "country", "device_type", "os", "os_version"],
  measures: [
    "clicks",
    "regs",
    "custom_conversion_8",
    "custom_conversion_7",
    "custom_conversion_8_revenue",
    "custom_conversion_7_revenue",
    "cost",
  ],
  range: { interval: "last_7_days", timezone: "Asia/Dubai" },
  filters: [
    {
      name: "campaign",
      operator: "MATCH_REGEXP",
      expression: "(Leo|Leticia|Carvalho|Akku|Enzo|Matheus|Sara|ZM ?apps|ZMAPPS)",
    },
  ],
  limit: 1000,
  offset: 0,
  sort: [],
  summary: true,
  extended: true,
};

const stringifyKeitaroPayload = (value) => JSON.stringify(value, null, 2);

const defaultKeitaroPayloadByTarget = {
  overall: stringifyKeitaroPayload(defaultKeitaroOverallPayloadObject),
  device: stringifyKeitaroPayload(defaultKeitaroDevicePayloadObject),
  user_behavior: stringifyKeitaroPayload({
    dimensions: ["day", "campaign", "country", "region", "city", "sub_id_1", "external_id"],
    measures: [
      "clicks",
      "regs",
      "custom_conversion_8",
      "custom_conversion_7",
      "custom_conversion_8_revenue",
      "custom_conversion_7_revenue",
      "cost",
    ],
    range: { interval: "last_7_days", timezone: "Asia/Dubai" },
    filters: [
      {
        name: "campaign",
        operator: "MATCH_REGEXP",
        expression: "(Leo|Leticia|Carvalho|Akku|Enzo|Matheus|Sara|ZM ?apps|ZMAPPS)",
      },
    ],
    limit: 1000,
    offset: 0,
    sort: [],
    summary: true,
    extended: true,
  }),
};

const defaultKeitaroPayload = defaultKeitaroPayloadByTarget.overall;

  const defaultKeitaroMapping = {
    dateField: "day",
    buyerField: "campaign",
    campaignField: "campaign",
    countryField: "country",
    cityField: "city",
    regionField: "region",
    placementField: "sub_id_1",
    domainField: "source",
    campaignNameField: "sub_id_3",
    adsetNameField: "sub_id_4",
    adNameField: "sub_id_5",
    externalIdField: "external_id",
    spendField: "cost",
    revenueField: "revenue",
    ftdRevenueField: "custom_conversion_8_revenue",
    redepositRevenueField: "custom_conversion_7_revenue",
  clicksField: "clicks",
  installsField: "installs",
  registersField: "regs",
  ftdsField: "custom_conversion_8",
  redepositsField: "custom_conversion_7",
  deviceField: "device_type",
  osField: "os",
  osVersionField: "os_version",
  osIconField: "os_icon",
  deviceModelField: "device_model",
};

const tooltipStyle = {
  background: "rgba(20, 22, 26, 0.95)",
  border: "1px solid #2b2e35",
  borderRadius: "10px",
  padding: "10px 12px",
  boxShadow: "0 12px 20px rgba(0,0,0,0.4)",
};

let activeFxRate = 1;

const setActiveFxRate = (rate) => {
  if (!Number.isFinite(rate) || rate <= 0) return;
  activeFxRate = rate;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value, rate = activeFxRate) => {
  if (value === null || value === undefined || value === "" || Number.isNaN(value)) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  const fxRate = Number.isFinite(rate) ? rate : 1;
  return currencyFormatter.format(numeric * fxRate);
};

const formatAxis = (value) => {
  if (value === 0) return "0k";
  const thousands = value / 1000;
  return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
};

const formatVolumeAxis = (value) => (value >= 1000 ? formatAxis(value) : value);

const formatValue = (value) =>
  Number.isInteger(value) ? value : Number(value).toFixed(2);

const toGradientId = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const axisTickStyle = { fill: "#8b909a", fontSize: 11 };
const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const getDefaultDateRange = () => {
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  return { from: formatIsoDate(start), to: formatIsoDate(end) };
};
const normalizeDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return formatIsoDate(value);
  }
  const text = String(value || "").trim();
  if (!text) return null;
  const direct = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (direct) {
    return `${direct[1]}-${direct[2]}-${direct[3]}`;
  }
  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) return null;
  return formatIsoDate(parsed);
};
const normalizeDateRange = (from, to) => {
  let normalizedFrom = normalizeDateValue(from);
  let normalizedTo = normalizeDateValue(to);
  if (normalizedFrom && normalizedTo && normalizedFrom > normalizedTo) {
    [normalizedFrom, normalizedTo] = [normalizedTo, normalizedFrom];
  }
  return { from: normalizedFrom, to: normalizedTo };
};
const getPeriodDateRange = (value, customRange) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + mondayOffset);
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setDate(startOfWeek.getDate() - 1);

  switch (value) {
    case "Today":
      return normalizeDateRange(today, today);
    case "Yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return normalizeDateRange(yesterday, yesterday);
    }
    case "This Week":
      return normalizeDateRange(startOfWeek, today);
    case "Last Week":
      return normalizeDateRange(startOfLastWeek, endOfLastWeek);
    case "This Month":
      return normalizeDateRange(startOfMonth, today);
    case "Last Month":
      return normalizeDateRange(startOfLastMonth, endOfLastMonth);
    case "Custom range":
      return normalizeDateRange(customRange?.from, customRange?.to);
    default:
      return { from: null, to: null };
  }
};
const isDateInRange = (value, range) => {
  const day = normalizeDateValue(value);
  if (!range?.from && !range?.to) return true;
  if (!day) return false;
  if (range?.from && day < range.from) return false;
  if (range?.to && day > range.to) return false;
  return true;
};
const normalizeFilterValue = (value) => String(value || "").trim().toLowerCase();
const isAllSelection = (value) => !value || normalizeFilterValue(value) === "all";
const normalizeBuyerKey = (value) =>
  String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const escapeRegExp = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const matchesBuyerName = (buyer, selectedBuyer) => {
  const normalizedBuyer = normalizeBuyerKey(buyer);
  const normalizedSelected = normalizeBuyerKey(selectedBuyer);
  if (!normalizedBuyer || !normalizedSelected) return false;
  if (normalizedBuyer === normalizedSelected || normalizedBuyer.startsWith(normalizedSelected)) {
    return true;
  }
  const rawBuyer = normalizeFilterValue(buyer);
  const rawSelected = normalizeFilterValue(selectedBuyer);
  if (!rawBuyer || !rawSelected) return false;
  const boundary = new RegExp(`(^|[^a-z0-9])${escapeRegExp(rawSelected)}([^a-z0-9]|$)`);
  return boundary.test(rawBuyer);
};
const matchesBuyerFilter = (buyer, selectedBuyer, viewerBuyer, isLeadership) => {
  if (!isLeadership) {
    if (!viewerBuyer) return true;
    return matchesBuyerName(buyer, viewerBuyer);
  }
  if (isAllSelection(selectedBuyer)) return true;
  return matchesBuyerName(buyer, selectedBuyer);
};
const matchesCountryFilter = (country, selectedCountry) => {
  if (isAllSelection(selectedCountry)) return true;
  return normalizeFilterValue(country) === normalizeFilterValue(selectedCountry);
};
const formatShortDate = (value) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length < 3) return value;
  const monthIndex = Number(parts[1]) - 1;
  const month = shortMonths[monthIndex] ?? parts[1];
  return `${parts[2]} ${month}`;
};

const homeChartSeries = [
  { key: "c2i", label: "Click2Install", color: "var(--blue)", width: 2.2 },
  { key: "c2r", label: "Click2Register", color: "var(--purple)", width: 2 },
  { key: "i2r", label: "Install2Reg", color: "var(--green)", width: 2 },
  { key: "r2d", label: "Reg2Dep", color: "var(--orange)", width: 2 },
];

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const geoReference = {
  Argentina: { iso: "ARG", coordinates: [-63.6167, -38.4161] },
  Australia: { iso: "AUS", coordinates: [133.7751, -25.2744] },
  Azerbaijan: { iso: "AZE", coordinates: [47.5769, 40.1431] },
  Albania: { iso: "ALB", coordinates: [20.1683, 41.1533] },
  Algeria: { iso: "DZA", coordinates: [1.6596, 28.0339] },
  Bolivia: { iso: "BOL", coordinates: [-63.5887, -16.2902] },
  Brazil: { iso: "BRA", coordinates: [-51.9253, -14.235] },
  Canada: { iso: "CAN", coordinates: [-106.3468, 56.1304] },
  Chile: { iso: "CHL", coordinates: [-71.543, -35.6751] },
  Colombia: { iso: "COL", coordinates: [-74.2973, 4.5709] },
  "Costa Rica": { iso: "CRI", coordinates: [-83.7534, 9.7489] },
  Ecuador: { iso: "ECU", coordinates: [-78.1834, -1.8312] },
  Egypt: { iso: "EGY", coordinates: [30.8025, 26.8206] },
  Estonia: { iso: "EST", coordinates: [25.0136, 58.5953] },
  France: { iso: "FRA", coordinates: [2.2137, 46.2276] },
  Germany: { iso: "DEU", coordinates: [10.4515, 51.1657] },
  India: { iso: "IND", coordinates: [78.9629, 20.5937] },
  Iran: { iso: "IRN", coordinates: [53.688, 32.4279] },
  Iraq: { iso: "IRQ", coordinates: [43.6793, 33.2232] },
  Japan: { iso: "JPN", coordinates: [138.2529, 36.2048] },
  Morocco: { iso: "MAR", coordinates: [-7.0926, 31.7917] },
  "New Zealand": { iso: "NZL", coordinates: [174.8859, -40.9006] },
  Nigeria: { iso: "NGA", coordinates: [8.6753, 9.082] },
  Norway: { iso: "NOR", coordinates: [8.4689, 60.472] },
  Paraguay: { iso: "PRY", coordinates: [-58.4438, -23.4425] },
  Peru: { iso: "PER", coordinates: [-75.0152, -9.19] },
  Poland: { iso: "POL", coordinates: [19.1451, 51.9194] },
  Romania: { iso: "ROU", coordinates: [24.9668, 45.9432] },
  Russia: { iso: "RUS", coordinates: [105.3188, 61.524] },
  "South Korea": { iso: "KOR", coordinates: [127.7669, 35.9078] },
  Sweden: { iso: "SWE", coordinates: [18.6435, 60.1282] },
  Switzerland: { iso: "CHE", coordinates: [8.2275, 46.8182] },
  Tunisia: { iso: "TUN", coordinates: [9.5375, 33.8869] },
  Ukraine: { iso: "UKR", coordinates: [31.1656, 48.3794] },
  "United States": { iso: "USA", coordinates: [-98.5795, 39.8283] },
  Venezuela: { iso: "VEN", coordinates: [-66.5897, 6.4238] },
  Vietnam: { iso: "VNM", coordinates: [108.2772, 14.0583] },
  China: { iso: "CHN", coordinates: [104.1954, 35.8617] },
  Turkey: { iso: "TUR", coordinates: [35.2433, 38.9637] },
  Guyana: { iso: "GUY", coordinates: [-58.9302, 4.8604] },
  Netherlands: { iso: "NLD", coordinates: [5.2913, 52.1326] },
  "United Arab Emirates": { iso: "ARE", coordinates: [53.8478, 23.4241] },
};
const geoPalette = [
  "var(--green)",
  "var(--blue)",
  "var(--purple)",
  "var(--yellow)",
  "var(--pink)",
  "var(--orange)",
];

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{label}</p>
      {payload.map((item) => (
        <div className="tooltip-row" key={item.dataKey}>
          <span
            className="tooltip-dot"
            style={{ background: item.color || item.fill || item.stroke }}
          />
          <span>{item.name}</span>
          <span className="tooltip-value">{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function RateTooltip({ active, payload }) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div className="chart-tooltip rate-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{item.name}</p>
      <div className="tooltip-row">
        <span className="tooltip-dot" style={{ background: item.color }} />
        <span>{t("Rate")}</span>
        <span className="tooltip-value">{item.value}%</span>
      </div>
    </div>
  );
}

function ShareTooltip({ active, payload }) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div className="chart-tooltip rate-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{item.name}</p>
      <div className="tooltip-row">
        <span className="tooltip-dot" style={{ background: item.color }} />
        <span>{t("Share")}</span>
        <span className="tooltip-value">{item.value}%</span>
      </div>
    </div>
  );
}

function PeriodSelect({ value, onChange, customRange, onCustomChange }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [showCustom, setShowCustom] = React.useState(false);
  const containerRef = React.useRef(null);
  const normalizedCustomRange = React.useMemo(
    () => normalizeDateRange(customRange?.from, customRange?.to),
    [customRange?.from, customRange?.to]
  );
  const canApplyCustomRange = Boolean(normalizedCustomRange.from && normalizedCustomRange.to);

  React.useEffect(() => {
    if (!open) return;
    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setShowCustom(false);
      }
    };
    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handleSelect = (option) => {
    onChange(option);
    setShowCustom(false);
    setOpen(false);
  };

  const handleCustomToggle = () => {
    setOpen(true);
    setShowCustom(true);
  };

  const handleApplyCustom = () => {
    if (!canApplyCustomRange) return;
    if (customRange?.from !== normalizedCustomRange.from) {
      onCustomChange("from", normalizedCustomRange.from);
    }
    if (customRange?.to !== normalizedCustomRange.to) {
      onCustomChange("to", normalizedCustomRange.to);
    }
    onChange("Custom range");
    setOpen(false);
  };

  return (
    <div className="period-select" ref={containerRef}>
      <button
        className="select"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        {t(value)}
        <span className="chev">▾</span>
      </button>
      {open && (
        <div className="period-menu">
          {periodOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`period-option${value === option ? " is-active" : ""}`}
              onClick={() => handleSelect(option)}
            >
              {t(option)}
            </button>
          ))}
          <button
            type="button"
            className={`period-option${value === "Custom range" ? " is-active" : ""}`}
            onClick={handleCustomToggle}
          >
            {t("Custom range")}
          </button>
          {showCustom && (
            <div className="period-custom">
              <div className="field-row">
                <input
                  type="date"
                  value={customRange.from}
                  onChange={(event) => onCustomChange("from", event.target.value)}
                />
                <span className="field-sep">{t("to")}</span>
                <input
                  type="date"
                  value={customRange.to}
                  onChange={(event) => onCustomChange("to", event.target.value)}
                />
              </div>
              <div className="period-actions">
                <button className="ghost" type="button" onClick={() => setShowCustom(false)}>
                  {t("Cancel")}
                </button>
                <button
                  className="action-pill"
                  type="button"
                  onClick={handleApplyCustom}
                  disabled={!canApplyCustomRange}
                >
                  {t("Apply")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label, visibleKeys }) {
  if (!active || !payload?.length) return null;
  const filtered = visibleKeys
    ? payload.filter((item) => visibleKeys.includes(item.dataKey))
    : payload;
  const formatValue = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "—";
    return numeric.toFixed(2);
  };

  return (
    <div className="chart-tooltip" style={tooltipStyle}>
      <p className="tooltip-label">{label}</p>
      {filtered.map((item) => (
        <div className="tooltip-row" key={item.dataKey}>
          <span className="tooltip-dot" style={{ background: item.stroke }} />
          <span>{item.name}</span>
          <span className="tooltip-value">{formatValue(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function HomeDashboard({
  period,
  setPeriod,
  customRange,
  onCustomChange,
  filters,
  onSeeGeos,
  authUser,
  viewerBuyer,
}) {
  const { t } = useLanguage();
  const isLeadership = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const [hoverSeries, setHoverSeries] = React.useState(null);
  const [selectedSeries, setSelectedSeries] = React.useState([]);
  const [hoverGeo, setHoverGeo] = React.useState(null);
  const [selectedGeo, setSelectedGeo] = React.useState(null);
  const [activeRateIndex, setActiveRateIndex] = React.useState(null);
  const [geoMetric, setGeoMetric] = React.useState("combined");
  const [homeRows, setHomeRows] = React.useState([]);
  const [homeState, setHomeState] = React.useState({ loading: true, error: null });

  const loadHomeStats = React.useCallback(async () => {
    try {
      setHomeState({ loading: true, error: null });
      const response = await apiFetch("/api/media-stats?limit=100000");
      if (!response.ok) {
        throw new Error("Failed to load media buyer stats.");
      }
      const data = await response.json();
      setHomeRows(Array.isArray(data) ? data : []);
      setHomeState({ loading: false, error: null });
    } catch (error) {
      setHomeState({ loading: false, error: error.message || "Failed to load stats." });
    }
  }, []);

  React.useEffect(() => {
    loadHomeStats();
  }, [loadHomeStats]);

  React.useEffect(() => {
    const handleSync = () => {
      loadHomeStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [loadHomeStats]);

  const buyerFilter = filters?.buyer || "All";
  const countryFilter = filters?.country || "All";

  const sum = (value) => Number(value || 0);
  const readNumeric = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };
  const readFtdRevenue = (row) =>
    readNumeric(row?.ftdRevenue ?? row?.ftd_revenue ?? 0);
  const readRedepositRevenue = (row) =>
    readNumeric(row?.redepositRevenue ?? row?.redeposit_revenue ?? 0);
  const readTotalRevenue = (row) => {
    const direct = row?.revenue;
    const ftdValue = readFtdRevenue(row);
    const redepositValue = readRedepositRevenue(row);
    if (direct !== undefined && direct !== null && direct !== "") {
      const numeric = Number(direct);
      if (Number.isFinite(numeric)) {
        if (numeric === 0 && (ftdValue > 0 || redepositValue > 0)) {
          return ftdValue + redepositValue;
        }
        return numeric;
      }
    }
    return ftdValue + redepositValue;
  };
  const safeDivide = (num, denom) => (denom > 0 ? num / denom : null);
  const toPercent = (num, denom) => {
    const value = safeDivide(num, denom);
    return value === null ? null : value * 100;
  };
  const fmtPercent = (value) =>
    value === null || Number.isNaN(value) ? "—" : `${value.toFixed(2)}%`;
  const fmtCount = (value) => {
    if (value === null || value === undefined) return "—";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "—";
    return Number.isInteger(numeric) ? numeric.toLocaleString() : numeric.toFixed(2);
  };
  const normalizeBuyerKey = (value) =>
    String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizeFilterValue = (value) => String(value || "").trim().toLowerCase();
  const isAllSelection = (value) => !value || normalizeFilterValue(value) === "all";
  const matchesBuyer = (buyer) => {
    const normalizedBuyer = normalizeBuyerKey(buyer);
    if (!normalizedBuyer) return false;
    if (isAllSelection(buyerFilter)) {
      if (isLeadership) return true;
      if (viewerBuyer) {
        const normalizedViewer = normalizeBuyerKey(viewerBuyer);
        return normalizedBuyer.includes(normalizedViewer);
      }
      return true;
    }
    const normalizedFilter = normalizeBuyerKey(buyerFilter);
    if (!normalizedFilter) return false;
    return normalizedBuyer.includes(normalizedFilter) || normalizedFilter.includes(normalizedBuyer);
  };
  const matchesCountry = (country) => {
    if (isAllSelection(countryFilter)) return true;
    return normalizeFilterValue(country) === normalizeFilterValue(countryFilter);
  };

  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const filterRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveRange = filterRange.from || filterRange.to ? filterRange : periodRange;

  const filteredRows = React.useMemo(() => {
    return homeRows.filter((row) => {
      if (!matchesBuyer(row.buyer)) return false;
      if (!matchesCountry(row.country)) return false;
      if (!isDateInRange(row.date, effectiveRange)) return false;
      return true;
    });
  }, [
    homeRows,
    buyerFilter,
    countryFilter,
    effectiveRange.from,
    effectiveRange.to,
    isLeadership,
    viewerBuyer,
  ]);

  const totals = React.useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => ({
          spend: acc.spend + sum(row.spend),
          clicks: acc.clicks + sum(row.clicks),
          installs: acc.installs + sum(row.installs),
          registers: acc.registers + sum(row.registers),
          ftds: acc.ftds + sum(row.ftds),
          redeposits: acc.redeposits + sum(row.redeposits),
        }),
        { spend: 0, clicks: 0, installs: 0, registers: 0, ftds: 0, redeposits: 0 }
      ),
    [filteredRows]
  );

  const c2i = toPercent(totals.installs, totals.clicks);
  const c2r = toPercent(totals.registers, totals.clicks);
  const i2r = toPercent(totals.registers, totals.installs);
  const r2d = toPercent(totals.ftds, totals.registers);
  const periodLabel =
    period === "Custom range" && periodRange.from && periodRange.to
      ? `${periodRange.from} → ${periodRange.to}`
      : t(period);

  const homePrimaryStats = [
    { label: "Clicks", value: fmtCount(totals.clicks), icon: MousePointerClick, meta: periodLabel },
    { label: "Install", value: fmtCount(totals.installs), icon: Download, meta: periodLabel },
    { label: "Register", value: fmtCount(totals.registers), icon: UserPlus, meta: periodLabel },
    { label: "FTD", value: fmtCount(totals.ftds), icon: CreditCard, meta: periodLabel },
  ];

  const homeSecondaryStats = [
    { label: "Click2Install", value: fmtPercent(c2i), icon: MousePointerClick, meta: "Conversion rate" },
    { label: "Click2Register", value: fmtPercent(c2r), icon: UserPlus, meta: "Conversion rate" },
    { label: "Install2Reg", value: fmtPercent(i2r), icon: Download, meta: "Conversion rate" },
    { label: "Reg2Dep", value: fmtPercent(r2d), icon: CreditCard, meta: "Conversion rate" },
  ];

  const chartData = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const key = row.date;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          date: key,
          clicks: 0,
          installs: 0,
          registers: 0,
          ftds: 0,
        });
      }
      const current = map.get(key);
      current.clicks += sum(row.clicks);
      current.installs += sum(row.installs);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
    });
    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => ({
        day: formatShortDate(row.date),
        c2i: toPercent(row.installs, row.clicks),
        c2r: toPercent(row.registers, row.clicks),
        i2r: toPercent(row.registers, row.installs),
        r2d: toPercent(row.ftds, row.registers),
      }));
  }, [filteredRows]);

  const revenueSeries = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const key = row.date;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          date: key,
          revenue: 0,
          ftdRevenue: 0,
          redepositRevenue: 0,
          ftds: 0,
          redeposits: 0,
        });
      }
      const current = map.get(key);
      current.revenue += readTotalRevenue(row);
      current.ftdRevenue += readFtdRevenue(row);
      current.redepositRevenue += readRedepositRevenue(row);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRows]);

  const revenueTotals = revenueSeries.reduce(
    (acc, item) => ({
      revenue: acc.revenue + item.revenue,
      ftdRevenue: acc.ftdRevenue + item.ftdRevenue,
      redepositRevenue: acc.redepositRevenue + item.redepositRevenue,
      ftds: acc.ftds + item.ftds,
      redeposits: acc.redeposits + item.redeposits,
    }),
    { revenue: 0, ftdRevenue: 0, redepositRevenue: 0, ftds: 0, redeposits: 0 }
  );

  const avg = (values) =>
    values.length ? values.reduce((sumValue, value) => sumValue + value, 0) / values.length : null;
  const dailyFtdRevenue = revenueSeries
    .filter((item) => item.ftdRevenue > 0)
    .map((item) => item.ftdRevenue);
  const dailyRedepositRevenue = revenueSeries
    .filter((item) => item.redepositRevenue > 0)
    .map((item) => item.redepositRevenue);
  const dailyCrFtdToRedeposit = revenueSeries
    .filter((item) => item.ftds > 0)
    .map((item) => (item.redeposits / item.ftds) * 100);

  const benchmark = {
    ftdRevenue: avg(dailyFtdRevenue),
    redepositRevenue: avg(dailyRedepositRevenue),
    ftdToRedepositCr: avg(dailyCrFtdToRedeposit),
  };

  const classifyMetric = (value, baseline) => {
    if (value === null || baseline === null || !Number.isFinite(baseline)) {
      return { tone: "neutral", label: t("No benchmark") };
    }
    const ratio = value / baseline;
    if (ratio >= 1.1) return { tone: "good", label: t("Above avg") };
    if (ratio <= 0.9) return { tone: "bad", label: t("Below avg") };
    return { tone: "neutral", label: t("On target") };
  };

  const ftdRevenueTotal = revenueTotals.ftdRevenue;
  const redepositRevenueTotal = revenueTotals.redepositRevenue;
  const ftdToRedepositCr =
    revenueTotals.ftds > 0 ? (revenueTotals.redeposits / revenueTotals.ftds) * 100 : null;

  const ftdRevenueStatus = classifyMetric(ftdRevenueTotal, benchmark.ftdRevenue);
  const redepositRevenueStatus = classifyMetric(
    redepositRevenueTotal,
    benchmark.redepositRevenue
  );
  const ftdToRedepositStatus = classifyMetric(ftdToRedepositCr, benchmark.ftdToRedepositCr);

  const funnelData = React.useMemo(
    () => [
      { name: "Clicks", value: totals.clicks, color: "var(--blue)" },
      { name: "Install", value: totals.installs, color: "var(--purple)" },
      { name: "Register", value: totals.registers, color: "var(--green)" },
      { name: "FTD", value: totals.ftds, color: "var(--orange)" },
    ],
    [totals]
  );
  const funnelMax = Math.max(0, ...funnelData.map((entry) => entry.value || 0));
  const funnelDomainMax = funnelMax > 0 ? Math.ceil(funnelMax / 50) * 50 : 10;

  const conversionData = React.useMemo(
    () => [
      { name: "Click2Install", value: c2i ? Math.round(c2i) : 0, color: "var(--blue)" },
      { name: "Click2Register", value: c2r ? Math.round(c2r) : 0, color: "var(--purple)" },
      { name: "Install2Reg", value: i2r ? Math.round(i2r) : 0, color: "var(--green)" },
      { name: "Reg2Dep", value: r2d ? Math.round(r2d) : 0, color: "var(--orange)" },
    ],
    [c2i, c2r, i2r, r2d]
  );

  const avgRate = conversionData.length
    ? Math.round(conversionData.reduce((sumValue, item) => sumValue + item.value, 0) / conversionData.length)
    : 0;
  const donutValue =
    activeRateIndex !== null ? `${conversionData[activeRateIndex].value}%` : `${avgRate}%`;
  const donutLabel =
    activeRateIndex !== null ? t(conversionData[activeRateIndex].name) : t("Avg rate");

  const geoMetrics = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "").trim();
      if (!country) return;
      if (!map.has(country)) {
        map.set(country, { clicks: 0, registers: 0, ftds: 0 });
      }
      const current = map.get(country);
      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
    });
    return Array.from(map.entries()).map(([country, stats], index) => {
      const ftdRate = toPercent(stats.ftds, stats.clicks) ?? 0;
      const reg2depRate = toPercent(stats.ftds, stats.registers) ?? 0;
      const ref = geoReference[country] || {};
      return {
        name: country,
        iso: ref.iso || country,
        coordinates: ref.coordinates || null,
        color: geoPalette[index % geoPalette.length],
        ftdRate: Math.round(ftdRate),
        reg2depRate: Math.round(reg2depRate),
      };
    });
  }, [filteredRows]);

  const geoMetricKey = geoMetric === "combined" ? "combined" : geoMetric;
  const geoMetricsWithCombined = React.useMemo(
    () =>
      geoMetrics.map((marker) => ({
        ...marker,
        combined: Math.round((marker.ftdRate + marker.reg2depRate) / 2),
      })),
    [geoMetrics]
  );
  const geoSorted = React.useMemo(
    () => [...geoMetricsWithCombined].sort((a, b) => b[geoMetricKey] - a[geoMetricKey]),
    [geoMetricsWithCombined, geoMetricKey]
  );
  const topGeoList = geoSorted.slice(0, 3);
  const metricValues = geoSorted.map((item) => item[geoMetricKey]);
  const metricMax = metricValues.length ? Math.max(...metricValues) : 0;
  const activeGeo = selectedGeo ?? hoverGeo;
  const activeGeoData = geoMetricsWithCombined.find((marker) => marker.iso === activeGeo) || null;
  const topGeo = geoSorted[0] || null;
  const focusGeo = activeGeoData || topGeo;
  const mapGeo = focusGeo || topGeo;
  const mapIso = mapGeo?.iso && mapGeo.iso.length === 3 ? mapGeo.iso : null;
  const mapColor = mapGeo?.color || "var(--green)";

  const geoMetricOptions = [
    { value: "combined", label: t("Combined") },
    { value: "ftdRate", label: t("FTD rate") },
    { value: "reg2depRate", label: t("Reg2Dep rate") },
  ];

  const activeGeoName = focusGeo?.name;

  const handleSeriesToggle = (key) => {
    setSelectedSeries((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const effectiveHover = selectedSeries.length ? null : hoverSeries;
  const tooltipVisibleKeys = selectedSeries.length
    ? selectedSeries
    : effectiveHover
    ? [effectiveHover]
    : null;

  const isSeriesActive = (key) => {
    if (selectedSeries.length) return selectedSeries.includes(key);
    if (effectiveHover) return effectiveHover === key;
    return true;
  };

  const isSeriesMuted = (key) => {
    if (selectedSeries.length) return !selectedSeries.includes(key);
    if (effectiveHover) return effectiveHover !== key;
    return false;
  };

  const handleGeoEnter = (iso) => {
    if (!selectedGeo) setHoverGeo(iso);
  };

  const handleGeoLeave = () => {
    if (!selectedGeo) setHoverGeo(null);
  };

  const handleGeoToggle = (iso) => {
    setSelectedGeo((prev) => (prev === iso ? null : iso));
    setHoverGeo(null);
  };


  return (
    <>
      {homeState.loading && homeRows.length === 0 ? (
        <div className="empty-state">{t("Loading media stats…")}</div>
      ) : null}
      {homeState.error ? <div className="empty-state error">{homeState.error}</div> : null}
      <section className="cards">
        {homePrimaryStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
            >
              <div className="card-head">
                <Icon size={20} />
                {t(stat.label)}
              </div>
              <div className="card-value">{stat.value}</div>
              <div className="card-meta">{t(stat.meta)}</div>
            </motion.div>
          );
        })}
      </section>

      <section className="cards secondary">
        {homeSecondaryStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.08, duration: 0.5 }}
            >
              <div className="card-head">
                <Icon size={20} />
                {t(stat.label)}
              </div>
              <div className="card-value">{stat.value}</div>
              <div className="card-meta">{t(stat.meta)}</div>
            </motion.div>
          );
        })}
      </section>

      <section className="panels">
        <motion.div
          className="panel stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Statistics")}</h3>
              <p className="panel-subtitle">{t("Daily conversion rates")}</p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {homeChartSeries.map((series) => (
                    <linearGradient
                      key={series.key}
                      id={`smooth-${toGradientId(series.key)}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={series.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={series.color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8b909a", fontSize: 11 }}
                />
                <YAxis
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  tick={{ fill: "#8b909a", fontSize: 11 }}
                />
                <Tooltip
                  content={(props) => (
                    <ChartTooltip {...props} visibleKeys={tooltipVisibleKeys} />
                  )}
                />
                {homeChartSeries.map((series) => {
                  const active = isSeriesActive(series.key);
                  const muted = isSeriesMuted(series.key);
                  return (
                    <Area
                      key={series.key}
                      type="natural"
                      dataKey={series.key}
                      name={t(series.label)}
                      stroke={series.color}
                      strokeWidth={active ? series.width + 0.8 : series.width + 0.4}
                      strokeOpacity={muted ? 0.2 : 1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill={`url(#smooth-${toGradientId(series.key)})`}
                      fillOpacity={muted ? 0.05 : active ? 0.28 : 0.18}
                      dot={false}
                      activeDot={
                        active
                          ? { r: 4, fill: "#0f1216", stroke: series.color, strokeWidth: 2 }
                          : false
                      }
                      isAnimationActive
                      animationDuration={900}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
            <div className="legend">
              {homeChartSeries.map((item) => {
                const active = selectedSeries.length
                  ? selectedSeries.includes(item.key)
                  : hoverSeries === item.key;
                const muted = isSeriesMuted(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    className={`legend-item is-interactive${active ? " is-active" : ""}${
                      muted ? " is-muted" : ""
                    }`}
                    onMouseEnter={() => setHoverSeries(item.key)}
                    onMouseLeave={() => setHoverSeries(null)}
                    onClick={() => handleSeriesToggle(item.key)}
                    aria-pressed={selectedSeries.includes(item.key)}
                  >
                    <span className="dot" style={{ background: item.color }} />
                    {t(item.label)}
                  </button>
                );
              })}
            </div>
            <p className="chart-hint">{t("Tip: hover or click legends to isolate a series.")}</p>
            <div className="revenue-blocks">
              <div className="revenue-head">
                <div>
                  <h4>{t("Revenue by date")}</h4>
                  <p>{t("Daily revenue trend for the selected period.")}</p>
                </div>
                <div className="revenue-total">
                  <span>{t("Total Revenue")}</span>
                  <strong>{formatCurrency(revenueTotals.revenue)}</strong>
                </div>
              </div>
              <div className="revenue-grid">
                <div className={`revenue-card ${ftdRevenueStatus.tone}`}>
                  <div className="revenue-card-head">
                    <span className="revenue-date">{t("FTD Revenue")}</span>
                    <span className={`revenue-chip ${ftdRevenueStatus.tone}`}>
                      {ftdRevenueStatus.label}
                    </span>
                  </div>
                  <strong>
                    {Number.isFinite(ftdRevenueTotal) ? formatCurrency(ftdRevenueTotal) : "—"}
                  </strong>
                </div>
                <div className={`revenue-card ${redepositRevenueStatus.tone}`}>
                  <div className="revenue-card-head">
                    <span className="revenue-date">{t("Redeposit Revenue")}</span>
                    <span className={`revenue-chip ${redepositRevenueStatus.tone}`}>
                      {redepositRevenueStatus.label}
                    </span>
                  </div>
                  <strong>
                    {Number.isFinite(redepositRevenueTotal)
                      ? formatCurrency(redepositRevenueTotal)
                      : "—"}
                  </strong>
                </div>
                <div className={`revenue-card ${ftdToRedepositStatus.tone}`}>
                  <div className="revenue-card-head">
                    <span className="revenue-date">{t("FTD to Redeposit CR")}</span>
                    <span className={`revenue-chip ${ftdToRedepositStatus.tone}`}>
                      {ftdToRedepositStatus.label}
                    </span>
                  </div>
                  <strong>
                    {ftdToRedepositCr === null ? "—" : `${ftdToRedepositCr.toFixed(2)}%`}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="panel map"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Top GEO")}</h3>
              <p className="panel-subtitle">
                {t("Highest FTD conversion rate and Reg2Dep conversion rate")}
              </p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="map-wrap">
            <div className="map-controls">
              {geoMetricOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`map-toggle${geoMetric === option.value ? " is-active" : ""}`}
                  onClick={() => setGeoMetric(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="map-grid">
              <div className="map-visual">
                <ComposableMap projectionConfig={{ scale: 120 }}>
                  <defs>
                    <radialGradient id="geo-heat" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor={mapColor} stopOpacity="0.95" />
                      <stop offset="55%" stopColor={mapColor} stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#1b1d21" stopOpacity="0.15" />
                    </radialGradient>
                  </defs>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const iso = geo.properties.ISO_A3;
                        const isHighlighted = mapIso && iso === mapIso;
                        const fill = isHighlighted ? "url(#geo-heat)" : "#353840";
                        const opacity = isHighlighted ? 0.95 : 0.28;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={fill}
                            stroke={isHighlighted ? "#f5f5f7" : "#1e2126"}
                            strokeWidth={isHighlighted ? 1.2 : 0.5}
                            style={{
                              default: {
                                outline: "none",
                                opacity,
                                cursor: isHighlighted ? "pointer" : "default",
                                filter: isHighlighted
                                  ? "drop-shadow(0 0 12px rgba(54, 208, 124, 0.35))"
                                  : "none",
                              },
                              hover: {
                                outline: "none",
                                opacity: isHighlighted ? 1 : opacity,
                              },
                              pressed: {
                                outline: "none",
                                opacity: 1,
                              },
                            }}
                            onMouseEnter={() => isHighlighted && handleGeoEnter(iso)}
                            onMouseLeave={() => isHighlighted && handleGeoLeave()}
                            onClick={() => isHighlighted && handleGeoToggle(iso)}
                          />
                        );
                      })
                    }
                  </Geographies>
                  {mapGeo?.coordinates ? (
                    <Marker
                      key={mapGeo.name}
                      coordinates={mapGeo.coordinates}
                      onMouseEnter={() => handleGeoEnter(mapGeo.iso)}
                      onMouseLeave={() => handleGeoLeave()}
                      onClick={() => handleGeoToggle(mapGeo.iso)}
                    >
                      <circle r={10} fill={mapGeo.color} opacity={0.2} />
                      <circle r={6.5} fill={mapGeo.color} stroke="#0b0c0e" strokeWidth={1} />
                    </Marker>
                  ) : null}
                </ComposableMap>
                <div className="legend geo">
                  {mapGeo ? (
                    <span className="legend-item">
                      <span className="dot" style={{ background: mapGeo.color }} />
                      {mapGeo.name}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="map-info">
                <div className="map-info-card">
                  <div className="map-info-head">
                    <span>{t("Active GEO")}</span>
                    <span className="map-info-metric">
                      {geoMetricOptions.find((option) => option.value === geoMetric)?.label}
                    </span>
                  </div>
                  <div className="map-info-main">
                    <div className="map-info-name">{activeGeoName || t("None")}</div>
                    <span className="map-info-score">
                      {focusGeo ? `${focusGeo[geoMetricKey]}%` : "--"}
                    </span>
                  </div>
                  <div className="map-info-metrics">
                    <div className="map-metric">
                      <span>{t("FTD rate")}</span>
                      <strong>{focusGeo ? `${focusGeo.ftdRate}%` : "--"}</strong>
                    </div>
                    <div className="map-metric">
                      <span>{t("Reg2Dep rate")}</span>
                      <strong>{focusGeo ? `${focusGeo.reg2depRate}%` : "--"}</strong>
                    </div>
                    <div className="map-metric">
                      <span>{t("Combined")}</span>
                      <strong>{focusGeo ? `${focusGeo.combined}%` : "--"}</strong>
                    </div>
                  </div>
                </div>
                <div className="map-ranking">
                  <div className="map-ranking-head">
                    <span>{t("Top performers")}</span>
                    <span className="map-ranking-metric">
                      {geoMetricOptions.find((option) => option.value === geoMetric)?.label}
                    </span>
                  </div>
                  <div className="map-ranking-list">
                    {topGeoList.map((marker) => {
                      const value = marker[geoMetricKey] || 0;
                      const width = metricMax ? Math.round((value / metricMax) * 100) : 0;
                      return (
                        <button
                          key={marker.iso}
                          type="button"
                          className={`map-rank${activeGeo === marker.iso ? " is-active" : ""}`}
                          onMouseEnter={() => handleGeoEnter(marker.iso)}
                          onMouseLeave={() => handleGeoLeave()}
                          onClick={() => handleGeoToggle(marker.iso)}
                        >
                          <div className="map-rank-row">
                            <span className="dot" style={{ background: marker.color }} />
                            <span className="map-rank-name">{marker.name}</span>
                            <span className="map-rank-value">{value}%</span>
                          </div>
                          <div className="map-rank-bar">
                            <span style={{ width: `${width}%`, background: marker.color }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="map-ranking-footer">
                    <button
                      type="button"
                      className="ghost map-see-more"
                      onClick={() => onSeeGeos?.()}
                    >
                      {t("See more")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="panels extra">
        <motion.div
          className="panel stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Conversion Funnel")}</h3>
              <p className="panel-subtitle">{t("Stage counts for the selected period")}</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={funnelData}
                barSize={28}
                barCategoryGap="28%"
                margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
              >
                <defs>
                  {funnelData.map((entry) => (
                    <linearGradient
                      key={entry.name}
                      id={`funnel-${toGradientId(entry.name)}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="rgba(255,255,255,0.9)" stopOpacity="0.18" />
                      <stop offset="12%" stopColor={entry.color} stopOpacity="1" />
                      <stop offset="100%" stopColor={entry.color} stopOpacity="0.75" />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#7f848f" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  tick={{ fontSize: 11 }}
                  tickMargin={6}
                  allowDecimals={false}
                  domain={[0, funnelDomainMax]}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "#f4f6fb" }}
                  itemStyle={{ color: "#d7dde7" }}
                  formatter={(value) => [Number(value || 0).toLocaleString(), t("Value")]}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="value" radius={[10, 10, 6, 6]} minPointSize={4}>
                  {funnelData.map((entry) => (
                    <Cell key={entry.name} fill={`url(#funnel-${toGradientId(entry.name)})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="legend">
              {funnelData.map((item) => (
                <span className="legend-item" key={item.name}>
                  <span className="dot" style={{ background: item.color }} />
                  {t(item.name)}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="panel stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Conversion Rates")}</h3>
              <p className="panel-subtitle">{t("Average rate across each handoff")}</p>
            </div>
          </div>
          <div className="chart chart-center chart-surface">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={conversionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={98}
                    paddingAngle={4}
                    cornerRadius={8}
                    startAngle={90}
                    endAngle={-270}
                    stroke="rgba(12, 14, 17, 0.9)"
                    strokeWidth={2}
                    onMouseEnter={(_, index) => setActiveRateIndex(index)}
                    onMouseLeave={() => setActiveRateIndex(null)}
                    activeIndex={activeRateIndex ?? undefined}
                  >
                    {conversionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<RateTooltip />} wrapperStyle={{ zIndex: 40 }} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <div className="donut-value">{donutValue}</div>
                <div className="donut-label">{donutLabel}</div>
              </div>
            </div>
            <div className="legend">
              {conversionData.map((item, index) => (
                <button
                  type="button"
                  className={`legend-item is-interactive${
                    activeRateIndex === index ? " is-active" : ""
                  }`}
                  key={item.name}
                  onMouseEnter={() => setActiveRateIndex(index)}
                  onMouseLeave={() => setActiveRateIndex(null)}
                >
                  <span className="dot" style={{ background: item.color }} />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

    </>
  );
}

function GeosDashboard({ filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const [geoRows, setGeoRows] = React.useState([]);
  const [geoState, setGeoState] = React.useState({ loading: true, error: null });

  const loadGeos = React.useCallback(async () => {
    try {
      setGeoState({ loading: true, error: null });
      const response = await apiFetch("/api/media-stats?limit=100000");
      if (!response.ok) {
        throw new Error("Failed to load media buyer stats.");
      }
      const data = await response.json();
      setGeoRows(Array.isArray(data) ? data : []);
      setGeoState({ loading: false, error: null });
    } catch (error) {
      setGeoState({ loading: false, error: error.message || "Failed to load stats." });
    }
  }, []);

  React.useEffect(() => {
    loadGeos();
  }, [loadGeos]);

  React.useEffect(() => {
    const handleSync = () => {
      loadGeos();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [loadGeos]);

  const buyerFilter = filters?.buyer || "All";
  const countryFilter = filters?.country || "All";
  const regionFilter = filters?.city || "All";
  const dateFrom = filters?.dateFrom;
  const dateTo = filters?.dateTo;
  const normalizeBuyerKey = (value) =>
    String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizeFilterValue = (value) => String(value || "").trim().toLowerCase();
  const isAllSelection = (value) => !value || normalizeFilterValue(value) === "all";

  const sum = (value) => Number(value || 0);
  const safeDivide = (num, denom) => (denom > 0 ? num / denom : null);
  const toPercent = (num, denom) => {
    const value = safeDivide(num, denom);
    return value === null ? null : value * 100;
  };
  const fmtPercent = (value) =>
    value === null || Number.isNaN(value) ? "—" : `${value.toFixed(2)}%`;
  const fmtCost = (value) =>
    value === null || Number.isNaN(value) ? "—" : formatCurrency(value);
  const renderMetricTooltip = (labelKey, valueKey, valueLabel) => ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0]?.payload || {};
    const label = item[labelKey] || payload[0]?.name || "";
    const value = item[valueKey] ?? payload[0]?.value;
    return (
      <div style={tooltipStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div>
          {valueLabel}: {formatCurrency(value || 0)}
        </div>
      </div>
    );
  };
  const matchesBuyer = (buyer) => {
    const normalizedBuyer = normalizeBuyerKey(buyer);
    if (!normalizedBuyer) return false;
    if (isAllSelection(buyerFilter)) {
      if (isLeadership) return true;
      if (viewerBuyer) {
        const normalizedViewer = normalizeBuyerKey(viewerBuyer);
        return normalizedBuyer.includes(normalizedViewer);
      }
      return true;
    }
    const normalizedFilter = normalizeBuyerKey(buyerFilter);
    if (!normalizedFilter) return false;
    return normalizedBuyer.includes(normalizedFilter) || normalizedFilter.includes(normalizedBuyer);
  };

  const filteredRows = React.useMemo(() => {
    const normalizedCountry = normalizeFilterValue(countryFilter);
    const normalizedRegion = normalizeFilterValue(regionFilter);
    const dateRange = normalizeDateRange(dateFrom, dateTo);
    return geoRows.filter((row) => {
      if (!matchesBuyer(row.buyer)) return false;
      const rowCountry = normalizeFilterValue(row.country);
      if (!isAllSelection(countryFilter) && rowCountry !== normalizedCountry) return false;
      const rowRegion = normalizeFilterValue(row.region || row.city);
      if (!isAllSelection(regionFilter) && !rowRegion.includes(normalizedRegion)) return false;
      if (!isDateInRange(row.date, dateRange)) return false;
      return true;
    });
  }, [
    geoRows,
    buyerFilter,
    countryFilter,
    regionFilter,
    dateFrom,
    dateTo,
    isLeadership,
    viewerBuyer,
  ]);

  const geoTotals = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "Unknown");
      if (!map.has(country)) {
        map.set(country, {
          country,
          spend: 0,
          revenue: 0,
          hasRevenue: false,
          ftdRevenue: 0,
          redepositRevenue: 0,
          clicks: 0,
          installs: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
        });
      }
      const current = map.get(country);
      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      current.spend += sum(row.spend);
      current.clicks += sum(row.clicks);
      current.installs += sum(row.installs);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.ftdRevenue = (current.ftdRevenue || 0) + ftdRevenueValue;
      current.redepositRevenue = (current.redepositRevenue || 0) + redepositRevenueValue;
      if (Number.isFinite(revenueValue)) {
        current.revenue += revenueValue;
        current.hasRevenue = true;
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const revenueSort = (b.revenue || 0) - (a.revenue || 0);
      if (revenueSort !== 0) return revenueSort;
      return (b.clicks || 0) - (a.clicks || 0);
    });
  }, [filteredRows]);

  const [geoTableSort, setGeoTableSort] = React.useState({ key: "revenue", dir: "desc" });
  const toggleGeoSort = (key) => {
    setGeoTableSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  };
  const getGeoSortValue = (row, key) => {
    const revenueValue = row.hasRevenue ? row.revenue : null;
    switch (key) {
      case "country":
        return String(row.country || "");
      case "spend":
        return row.spend ? row.spend : null;
      case "revenue":
        return revenueValue;
      case "clicks":
        return row.clicks;
      case "installs":
        return row.installs ? row.installs : null;
      case "registers":
        return row.registers;
      case "ftds":
        return row.ftds;
      case "redeposits":
        return row.redeposits ? row.redeposits : null;
      case "arppu":
        return revenueValue !== null && row.ftds > 0 ? revenueValue / row.ftds : null;
      case "ltv":
        return revenueValue !== null && row.redeposits > 0 ? revenueValue / row.redeposits : null;
      case "c2r":
        return toPercent(row.registers, row.clicks);
      case "c2ftd":
        return toPercent(row.ftds, row.clicks);
      case "r2d":
        return toPercent(row.ftds, row.registers);
      default:
        return null;
    }
  };
  const sortedGeoTotals = React.useMemo(() => {
    const rows = [...geoTotals];
    const { key, dir } = geoTableSort;
    const direction = dir === "asc" ? 1 : -1;
    return rows.sort((a, b) => {
      const aVal = getGeoSortValue(a, key);
      const bVal = getGeoSortValue(b, key);
      const aNull = aVal === null || aVal === undefined || Number.isNaN(aVal);
      const bNull = bVal === null || bVal === undefined || Number.isNaN(bVal);
      if (key === "country") {
        return direction * String(aVal || "").localeCompare(String(bVal || ""));
      }
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      if (aVal === bVal) return 0;
      return direction * (aVal > bVal ? 1 : -1);
    });
  }, [geoTotals, geoTableSort]);

  const cityTotalsAll = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const rawCity = String(row.region || row.city || "").trim();
      const countryLabel = String(row.country || "Unknown").trim() || "Unknown";
      const city = rawCity || `Unknown (${countryLabel})`;
      if (!map.has(city)) {
        map.set(city, {
          city,
          revenue: 0,
          spend: 0,
          ftds: 0,
          redeposits: 0,
          clicks: 0,
          registers: 0,
        });
      }
      const current = map.get(city);
      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      if (Number.isFinite(revenueValue)) {
        current.revenue += revenueValue;
      }
      current.spend += sum(row.spend);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
    });
    return Array.from(map.values()).sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  }, [filteredRows]);

  const cityTotals = React.useMemo(() => {
    return cityTotalsAll;
  }, [cityTotalsAll]);

  const geoSummary = React.useMemo(
    () =>
      geoTotals.reduce(
        (acc, row) => ({
          revenue: acc.revenue + (row.hasRevenue ? row.revenue : 0),
          clicks: acc.clicks + row.clicks,
          registers: acc.registers + row.registers,
          ftds: acc.ftds + row.ftds,
          redeposits: acc.redeposits + row.redeposits,
        }),
        { revenue: 0, clicks: 0, registers: 0, ftds: 0, redeposits: 0 }
      ),
    [geoTotals]
  );

  const geoTopLimit = 5;
  const geoChartRows = geoTotals.filter((row) => row.country && row.country !== "Unknown");
  const geoRevenueCandidates = geoChartRows.filter((row) => row.revenue > 0);
  const geoRevenueData = (geoRevenueCandidates.length ? geoRevenueCandidates : geoChartRows).slice(
    0,
    geoTopLimit
  );
  const geoArppuData = geoChartRows
    .map((row) => ({
      country: row.country,
      arppu: row.ftds > 0 ? row.revenue / row.ftds : 0,
    }))
    .filter((row) => row.arppu > 0)
    .sort((a, b) => b.arppu - a.arppu)
    .slice(0, geoTopLimit);
  const geoLtvData = geoChartRows
    .map((row) => ({
      country: row.country,
      ltv: row.redeposits > 0 ? row.revenue / row.redeposits : 0,
    }))
    .filter((row) => row.ltv > 0)
    .sort((a, b) => b.ltv - a.ltv)
    .slice(0, geoTopLimit);

  const cityRevenueCandidates = cityTotals.filter((row) => row.revenue > 0);
  const cityRevenueData = (cityRevenueCandidates.length ? cityRevenueCandidates : cityTotals).slice(
    0,
    geoTopLimit
  );
  const cityArppuData = cityTotals
    .map((row) => ({
      city: row.city,
      arppu: row.ftds > 0 ? row.revenue / row.ftds : 0,
      revenue: row.revenue,
      ftds: row.ftds,
    }))
    .filter((row) => row.revenue > 0 || row.ftds > 0)
    .sort((a, b) => b.arppu - a.arppu)
    .slice(0, geoTopLimit);
  const cityArppuTable = cityTotals
    .map((row) => ({
      city: row.city,
      arppu: row.ftds > 0 ? row.revenue / row.ftds : 0,
      ftds: row.ftds,
      ftdsDisplay: Math.round(row.ftds || 0),
      revenue: row.revenue,
    }))
    .filter((row) => row.revenue > 0 || row.ftds > 0)
    .sort((a, b) => b.arppu - a.arppu)
    .slice(0, geoTopLimit);
  const maxCityArppu = Math.max(1, ...cityArppuTable.map((row) => row.arppu || 0));
  const maxCityUsers = Math.max(1, ...cityArppuTable.map((row) => row.ftdsDisplay || 0));
  const cityLtvSource =
    cityTotals.some((row) => row.redeposits > 0 && row.revenue > 0) ? cityTotals : cityTotalsAll;
  const cityLtvData = cityLtvSource
    .map((row) => ({
      city: row.city,
      ltv: row.redeposits > 0 ? row.revenue / row.redeposits : 0,
    }))
    .filter((row) => row.ltv > 0)
    .sort((a, b) => b.ltv - a.ltv)
    .slice(0, geoTopLimit);

  const topGeoArppu = geoArppuData[0] || null;
  const topGeoLtv = geoLtvData[0] || null;
  const topGeoRevenue = geoRevenueData[0] || null;
  const topCityArppu = cityArppuData[0] || null;
  const topCityLtv = cityLtvData[0] || null;

  const ltvGrowthTargets = geoLtvData.map((row) => row.country);
  const ltvGrowthColors = ["#4b5bff", "#8b7bff", "#c6b9ff", "#7ed6ff", "#5cc9a5"];
  const ltvGrowthSeries = ltvGrowthTargets.map((country, index) => ({
    key: country,
    label: country,
    color: ltvGrowthColors[index % ltvGrowthColors.length],
  }));
  const arppuGrowthTargets = geoArppuData.map((row) => row.country);
  const arppuGrowthColors = ["#8b5cf6", "#a78bfa", "#d0b4ff", "#67e8f9", "#4ade80"];
  const arppuGrowthSeries = arppuGrowthTargets.map((country, index) => ({
    key: country,
    label: country,
    color: arppuGrowthColors[index % arppuGrowthColors.length],
  }));

  const ltvGrowthData = React.useMemo(() => {
    if (!ltvGrowthTargets.length) return [];
    const targetsSet = new Set(ltvGrowthTargets);
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "").trim();
      if (!targetsSet.has(country)) return;
      const date = row.date;
      if (!date) return;

      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      if (!map.has(date)) {
        map.set(date, { date, values: {} });
      }
      const entry = map.get(date);
      if (!entry.values[country]) {
        entry.values[country] = { revenue: 0, redeposits: 0 };
      }
      entry.values[country].revenue += revenueValue || 0;
      entry.values[country].redeposits += sum(row.redeposits);
    });

    return Array.from(map.values())
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((entry) => {
        const row = { date: entry.date, dateLabel: formatShortDate(entry.date) };
        ltvGrowthTargets.forEach((country) => {
          const stats = entry.values[country];
          row[country] = stats && stats.redeposits > 0 ? stats.revenue / stats.redeposits : 0;
      });
        return row;
      });
  }, [filteredRows, ltvGrowthTargets]);

  const arppuGrowthData = React.useMemo(() => {
    if (!arppuGrowthTargets.length) return [];
    const targetsSet = new Set(arppuGrowthTargets);
    const map = new Map();
    filteredRows.forEach((row) => {
      const country = String(row.country || "").trim();
      if (!targetsSet.has(country)) return;
      const date = row.date;
      if (!date) return;

      const ftdRevenueValue = Number.isFinite(Number(row.ftdRevenue ?? row.ftd_revenue))
        ? Number(row.ftdRevenue ?? row.ftd_revenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redepositRevenue ?? row.redeposit_revenue)
      )
        ? Number(row.redepositRevenue ?? row.redeposit_revenue)
        : 0;
      let revenueValue =
        row.revenue === undefined || row.revenue === null ? null : Number(row.revenue);
      if (!Number.isFinite(revenueValue)) {
        revenueValue = null;
      }
      if (revenueValue === null && (ftdRevenueValue || redepositRevenueValue)) {
        revenueValue = ftdRevenueValue + redepositRevenueValue;
      }

      if (!map.has(date)) {
        map.set(date, { date, values: {} });
      }
      const entry = map.get(date);
      if (!entry.values[country]) {
        entry.values[country] = { revenue: 0, ftds: 0 };
      }
      entry.values[country].revenue += revenueValue || 0;
      entry.values[country].ftds += sum(row.ftds);
    });

    return Array.from(map.values())
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((entry) => {
        const row = { date: entry.date, dateLabel: formatShortDate(entry.date) };
        arppuGrowthTargets.forEach((country) => {
          const stats = entry.values[country];
          row[country] = stats && stats.ftds > 0 ? stats.revenue / stats.ftds : 0;
        });
        return row;
      });
  }, [filteredRows, arppuGrowthTargets]);

  return (
    <>
      {!geoState.loading && !geoState.error && geoTotals.length ? (
        <>
          <section className="cards">
            {[
              {
                label: "Total Revenue",
                value: formatCurrency(geoSummary.revenue),
                icon: Wallet,
                meta: t("Filtered range"),
              },
              {
                label: "Total FTDs",
                value: geoSummary.ftds.toLocaleString(),
                icon: CreditCard,
                meta: t("Filtered range"),
              },
              {
                label: "Total Redeposits",
                value: geoSummary.redeposits.toLocaleString(),
                icon: CreditCard,
                meta: t("Filtered range"),
              },
              {
                label: "Top GEO Revenue",
                value: topGeoRevenue ? formatCurrency(topGeoRevenue.revenue) : "—",
                icon: Trophy,
                meta: topGeoRevenue ? topGeoRevenue.country : t("No data"),
              },
              {
                label: "Top GEO ARPPU",
                value: topGeoArppu ? formatCurrency(topGeoArppu.arppu) : "—",
                icon: Trophy,
                meta: topGeoArppu ? topGeoArppu.country : t("No data"),
              },
              {
                label: "Top GEO LTV",
                value: topGeoLtv ? formatCurrency(topGeoLtv.ltv) : "—",
                icon: Trophy,
                meta: topGeoLtv ? topGeoLtv.country : t("No data"),
              },
              {
                label: "Top Region ARPPU",
                value: topCityArppu ? formatCurrency(topCityArppu.arppu) : "—",
                icon: MapIcon,
                meta: topCityArppu ? topCityArppu.city : t("No data"),
              },
              {
                label: "Top Region LTV",
                value: topCityLtv ? formatCurrency(topCityLtv.ltv) : "—",
                icon: MapIcon,
                meta: topCityLtv ? topCityLtv.city : t("No data"),
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                >
                  <div className="card-head">
                    <Icon size={20} />
                    {t(stat.label)}
                  </div>
                  <div className="card-value">{stat.value}</div>
                  <div className="card-meta">{t(stat.meta)}</div>
                </motion.div>
              );
            })}
          </section>

          <div className="section-header">
            <div>
              <h3>{t("GEO Insights")}</h3>
              <p>{t("Top performing countries across revenue, ARPPU, and LTV.")}</p>
            </div>
          </div>
          <section className="panels geo-charts">
            <motion.div
              className="panel span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">{t("Top GEOs by Revenue")}</h3>
                  <p className="panel-subtitle">{t("Best performing GEOs by total revenue.")}</p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={geoRevenueData}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 90, bottom: 8 }}
                    barCategoryGap={12}
                  >
                    <defs>
                      <linearGradient id="geoRevenue" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="var(--green)" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="var(--green)" stopOpacity={0.25} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis
                      type="category"
                      dataKey="country"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [formatCurrency(value), t("Revenue")]}
                    />
                    <Bar dataKey="revenue" fill="url(#geoRevenue)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              className="panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">{t("ARPPU by GEO")}</h3>
                  <p className="panel-subtitle">{t("Average revenue per paying user (Revenue / FTDs).")}</p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={geoArppuData}
                    margin={{ top: 24, right: 24, left: 8, bottom: 24 }}
                    barCategoryGap={26}
                    barSize={42}
                  >
                    <defs>
                      <linearGradient id="geoArppu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--purple)" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="var(--purple)" stopOpacity={0.35} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis
                      dataKey="country"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      interval={0}
                      angle={-18}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [formatCurrency(value), t("ARPPU")]}
                    />
                    <Bar dataKey="arppu" fill="url(#geoArppu)" radius={[10, 10, 0, 0]}>
                      <LabelList
                        dataKey="arppu"
                        position="top"
                        formatter={(value) => formatCurrency(value)}
                        fill="rgba(255,255,255,0.9)"
                        fontSize={11}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              className="panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">{t("LTV (2+ Deposits) by GEO")}</h3>
                  <p className="panel-subtitle">{t("Approximate: Revenue / Redeposits.")}</p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={geoLtvData}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 90, bottom: 8 }}
                    barCategoryGap={12}
                  >
                    <defs>
                      <linearGradient id="geoLtv" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="var(--orange)" stopOpacity={0.25} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis
                      type="category"
                      dataKey="country"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [formatCurrency(value), t("LTV")]}
                    />
                    <Bar dataKey="ltv" fill="url(#geoLtv)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              className="panel span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">{t("LTV Growth Timeline")}</h3>
                  <p className="panel-subtitle">
                    {t("Daily LTV trend for the top GEOs (2+ deposits).")}
                  </p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={ltvGrowthData} margin={{ top: 8, right: 24, left: 4, bottom: 4 }}>
                    <defs>
                      {ltvGrowthSeries.map((series) => (
                        <linearGradient
                          key={`ltv-grad-${series.key}`}
                          id={`ltv-grad-${series.key}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor={series.color} stopOpacity={0.45} />
                          <stop offset="95%" stopColor={series.color} stopOpacity={0.05} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="dateLabel"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      minTickGap={18}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={70}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(label) => label}
                      formatter={(value, name) => [formatCurrency(value), name]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                    />
                    {ltvGrowthSeries.map((series, index) => (
                      <Area
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        name={series.label}
                        stroke={series.color}
                        strokeWidth={2}
                        fill={`url(#ltv-grad-${series.key})`}
                        fillOpacity={0.9}
                        connectNulls
                        dot={index === 0 ? { r: 2.5 } : false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              className="panel span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">{t("ARPPU Growth Timeline")}</h3>
                  <p className="panel-subtitle">
                    {t("Daily ARPPU trend for the top GEOs (Revenue / FTDs).")}
                  </p>
                </div>
              </div>
              <div className="chart chart-surface">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={arppuGrowthData}
                    margin={{ top: 8, right: 24, left: 4, bottom: 4 }}
                  >
                    <defs>
                      {arppuGrowthSeries.map((series) => (
                        <linearGradient
                          key={`arppu-grad-${series.key}`}
                          id={`arppu-grad-${series.key}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor={series.color} stopOpacity={0.45} />
                          <stop offset="95%" stopColor={series.color} stopOpacity={0.05} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="dateLabel"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      minTickGap={18}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={70}
                      tick={axisTickStyle}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(label) => label}
                      formatter={(value, name) => [formatCurrency(value), name]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                    />
                    {arppuGrowthSeries.map((series, index) => (
                      <Area
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        name={series.label}
                        stroke={series.color}
                        strokeWidth={2}
                        fill={`url(#arppu-grad-${series.key})`}
                        fillOpacity={0.9}
                        connectNulls
                        dot={index === 0 ? { r: 2.5 } : false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </section>

          <div className="section-header">
            <div>
              <h3>{t("Region Insights")}</h3>
              <p>{t("Best cities ranked by revenue, ARPPU, and LTV.")}</p>
            </div>
          </div>
          <section className="panels city-charts">
          <motion.div
            className="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="panel-head">
              <div>
                <h3 className="panel-title">{t("Top Regions by Revenue")}</h3>
                <p className="panel-subtitle">{t("Best performing regions by total revenue.")}</p>
              </div>
            </div>
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={cityRevenueData}
                  margin={{ top: 24, right: 20, left: 10, bottom: 24 }}
                  barCategoryGap={22}
                  barSize={36}
                >
                  <defs>
                    <linearGradient id="geoCityRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--green)" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="var(--green)" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="city"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={52}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatCurrency(value), t("Revenue")]}
                  />
                  <Bar dataKey="revenue" fill="url(#geoCityRevenue)" radius={[10, 10, 0, 0]}>
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={(value) => formatCurrency(value)}
                      fill="rgba(255,255,255,0.9)"
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="panel-head">
              <div>
                <h3 className="panel-title">{t("LTV (2+ Deposits) by Region")}</h3>
                <p className="panel-subtitle">{t("Approximate: Revenue / Redeposits.")}</p>
              </div>
            </div>
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top: 8, right: 24, left: 90, bottom: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis
                    type="number"
                    dataKey="ltv"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis
                    type="category"
                    dataKey="city"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    width={110}
                  />
                  <Tooltip content={renderMetricTooltip("city", "ltv", t("LTV"))} />
                  <Scatter data={cityLtvData} fill="var(--orange)" name={t("LTV")} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="panel span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="panel-head">
              <div>
                <h3 className="panel-title">{t("ARPPU by Region")}</h3>
                <p className="panel-subtitle">{t("Average revenue per paying user (Revenue / FTDs).")}</p>
              </div>
            </div>
            <div className="chart chart-surface">
              <div className="metric-table arppu-matrix">
                <div className="metric-row metric-header">
                  <div className="metric-cell city">{t("Region")}</div>
                  <div className="metric-cell value arppu">
                    {t("ARPPU")}
                    <span className="sort-caret">▾</span>
                  </div>
                  <div className="metric-cell value users">{t("FTDs")}</div>
                </div>
                {cityArppuTable.map((row) => (
                  <div className="metric-row" key={row.city}>
                    <div className="metric-cell city">{row.city}</div>
                    <div className="metric-cell value">
                      <span className="metric-pill arppu">{formatCurrency(row.arppu)}</span>
                    </div>
                    <div className="metric-cell value">
                      <span className="metric-pill ftds">{row.ftdsDisplay.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          </section>
        </>
      ) : null}

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("GEO Report")}</h3>
              <p className="panel-subtitle">
                {t("Performance by country for the selected filters.")}
              </p>
            </div>
          </div>
          {geoState.loading ? (
            <div className="empty-state">{t("Loading geo report…")}</div>
          ) : geoState.error ? (
            <div className="empty-state error">{geoState.error}</div>
          ) : geoTotals.length === 0 ? (
            <div className="empty-state">{t("No geo data yet.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table stats-table">
                <thead>
                  <tr>
                    {[
                      { key: "country", label: "Country" },
                      { key: "spend", label: "Spend" },
                      { key: "revenue", label: "Revenue" },
                      { key: "clicks", label: "Clicks" },
                      { key: "installs", label: "Installs" },
                      { key: "registers", label: "Registers" },
                      { key: "ftds", label: "FTDs" },
                      { key: "redeposits", label: "Redeposits" },
                      { key: "arppu", label: "ARPPU" },
                      { key: "ltv", label: "LTV" },
                      { key: "c2r", label: "C2R" },
                      { key: "c2ftd", label: "C2FTD" },
                      { key: "r2d", label: "R2D" },
                    ].map((col) => {
                      const isActive = geoTableSort.key === col.key;
                      const indicator = isActive
                        ? geoTableSort.dir === "asc"
                          ? "▲"
                          : "▼"
                        : "↕";
                      return (
                        <th key={col.key}>
                          <button
                            type="button"
                            className={`sortable-header ${isActive ? "active" : ""}`}
                            onClick={() => toggleGeoSort(col.key)}
                          >
                            {t(col.label)}
                            <span className="sort-indicator">{indicator}</span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedGeoTotals.map((row) => {
                    const revenueValue = row.hasRevenue ? row.revenue : null;
                    const arppu =
                      revenueValue !== null && row.ftds > 0
                        ? revenueValue / row.ftds
                        : null;
                    const ltv =
                      revenueValue !== null && row.redeposits > 0
                        ? revenueValue / row.redeposits
                        : null;
                    const c2r = toPercent(row.registers, row.clicks);
                    const c2f = toPercent(row.ftds, row.clicks);
                    const r2d = toPercent(row.ftds, row.registers);

                    return (
                      <tr key={row.country}>
                        <td>{row.country}</td>
                        <td>{row.spend ? formatCurrency(row.spend) : "—"}</td>
                        <td>{row.hasRevenue ? formatCurrency(row.revenue) : "—"}</td>
                        <td>{row.clicks.toLocaleString()}</td>
                        <td>{row.installs ? row.installs.toLocaleString() : "—"}</td>
                        <td>{row.registers.toLocaleString()}</td>
                        <td>{row.ftds.toLocaleString()}</td>
                        <td>{row.redeposits ? row.redeposits.toLocaleString() : "—"}</td>
                        <td>{fmtCost(arppu)}</td>
                        <td>{fmtCost(ltv)}</td>
                        <td>{fmtPercent(c2r)}</td>
                        <td>{fmtPercent(c2f)}</td>
                        <td>{fmtPercent(r2d)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

function FinancesDashboard({
  entry,
  entries,
  entryState,
  onEntryChange,
  onEntrySubmit,
  onEntryReset,
  onEntryStatusChange,
  onEntryDelete,
  canManageExpenses,
  period,
  setPeriod,
  customRange,
  onCustomChange,
}) {
  const { t } = useLanguage();
  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const periodLabel =
    period === "Custom range" && periodRange.from && periodRange.to
      ? `${periodRange.from} → ${periodRange.to}`
      : t(period);
  const filteredEntries = React.useMemo(
    () => entries.filter((row) => isDateInRange(row.date, periodRange)),
    [entries, periodRange.from, periodRange.to]
  );
  const isShortWindow =
    period === "Today" ||
    period === "Yesterday" ||
    period === "This Week" ||
    period === "Last Week" ||
    period === "Custom range";
  const financeTrendMap = React.useMemo(() => {
    const map = new Map();
    filteredEntries.forEach((row) => {
      const dateKey = normalizeDateValue(row.date);
      if (!dateKey) return;
      const bucketKey = isShortWindow ? dateKey : dateKey.slice(0, 7);
      const label = isShortWindow
        ? formatShortDate(dateKey)
        : (() => {
            const parts = bucketKey.split("-");
            if (parts.length < 2) return bucketKey;
            const month = shortMonths[Number(parts[1]) - 1] || parts[1];
            return month;
          })();
      if (!map.has(bucketKey)) {
        map.set(bucketKey, { key: bucketKey, label, traffic: 0, tools: 0, designs: 0, total: 0 });
      }
      const current = map.get(bucketKey);
      const amount = Number(row.amount || 0);
      const category = String(row.category || "").toLowerCase();
      if (category.includes("traffic")) {
        current.traffic += amount;
      } else if (category.includes("tool")) {
        current.tools += amount;
      } else if (category.includes("design")) {
        current.designs += amount;
      } else {
        current.tools += amount;
      }
      current.total += amount;
    });
    return map;
  }, [filteredEntries, isShortWindow]);

  const financeTrendData = React.useMemo(
    () => Array.from(financeTrendMap.values()).sort((a, b) => a.key.localeCompare(b.key)),
    [financeTrendMap]
  );

  const billingTotals = React.useMemo(() => {
    const totals = { Crypto: 0, "Bank Transfer": 0, Card: 0 };
    filteredEntries.forEach((row) => {
      const rawType = String(row.billing_type || row.billing || "").toLowerCase();
      if (rawType.includes("crypto")) {
        totals.Crypto += Number(row.amount || 0);
      } else if (rawType.includes("bank")) {
        totals["Bank Transfer"] += Number(row.amount || 0);
      } else if (rawType.includes("card")) {
        totals.Card += Number(row.amount || 0);
      }
    });
    return totals;
  }, [filteredEntries]);

  const billingTotalSpend = Object.values(billingTotals).reduce((sum, value) => sum + value, 0);
  const billingMixData = [
    {
      name: "Crypto",
      value: billingTotalSpend > 0 ? (billingTotals.Crypto / billingTotalSpend) * 100 : 0,
      color: "var(--blue)",
    },
    {
      name: "Bank Transfer",
      value: billingTotalSpend > 0 ? (billingTotals["Bank Transfer"] / billingTotalSpend) * 100 : 0,
      color: "var(--green)",
    },
    {
      name: "Card",
      value: billingTotalSpend > 0 ? (billingTotals.Card / billingTotalSpend) * 100 : 0,
      color: "var(--purple)",
    },
  ];

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const totalExpenses = filteredEntries.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const monthExpenses = entries.reduce(
    (sum, row) => (row.date?.startsWith(monthKey) ? sum + Number(row.amount || 0) : sum),
    0
  );
  const pendingCount = filteredEntries.filter(
    (row) => String(row.status).toLowerCase() === "requested"
  ).length;
  const doneCount = filteredEntries.filter((row) => String(row.status).toLowerCase() === "done").length;

  const financeMetrics = [
    { label: "Total Expenses", value: formatCurrency(totalExpenses), icon: Wallet, meta: periodLabel },
    {
      label: "This Month",
      value: formatCurrency(monthExpenses),
      icon: BarChart3,
      meta: "Current month",
    },
    { label: "Pending Requests", value: `${pendingCount}`, icon: Clock, meta: "Awaiting approval" },
    { label: "Completed", value: `${doneCount}`, icon: CheckCircle, meta: "Marked done" },
  ];

  const totalSpend = totalExpenses;
  const avgSpend = financeTrendData.length ? Math.round(totalSpend / financeTrendData.length) : 0;

  return (
    <>
      <section className="cards">
        {financeMetrics.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
            >
              <div className="card-head">
                <Icon size={20} />
                {t(stat.label)}
              </div>
              <div className="card-value">{stat.value}</div>
              <div className="card-meta">{t(stat.meta)}</div>
            </motion.div>
          );
        })}
      </section>

      <section className="form-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Manual Entry")}</h3>
              <p className="panel-subtitle">
                {t("Track expenses by date, country, category, and billing type.")}
              </p>
            </div>
          </div>
          <form className="form-grid" onSubmit={onEntrySubmit}>
            <div className="field">
              <label>{t("Date")}</label>
              <input type="date" value={entry.date} onChange={onEntryChange("date")} />
            </div>
            <div className="field">
              <label>{t("Country")}</label>
              <select value={entry.country} onChange={onEntryChange("country")}> 
                {countryOptions.map((country) => (
                  <option key={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("Category")}</label>
              <select value={entry.category} onChange={onEntryChange("category")}> 
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {t(category)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("Reference")}</label>
              <input
                type="text"
                placeholder={t("Tool, vendor, or invoice reference")}
                value={entry.reference}
                onChange={onEntryChange("reference")}
              />
            </div>
          <div className="field">
            <label>{t("Billing type")}</label>
            <select value={entry.billing} onChange={onEntryChange("billing")}> 
              {billingOptions.map((type) => (
                <option key={type} value={type}>
                  {t(type)}
                </option>
              ))}
            </select>
          </div>
          {entry.billing === "Crypto" ? (
            <>
              <div className="field">
                <label>{t("Network")}</label>
                <select value={entry.cryptoNetwork} onChange={onEntryChange("cryptoNetwork")}>
                  {["TRC20", "ERC20", "BTC", "Other"].map((network) => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t("TX Hash")}</label>
                <input
                  type="text"
                  placeholder={t("Paste transaction hash")}
                  value={entry.cryptoHash}
                  onChange={onEntryChange("cryptoHash")}
                />
              </div>
            </>
          ) : null}
            <div className="field">
              <label>{t("Amount (USD)")}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={entry.amount}
                onChange={onEntryChange("amount")}
              />
            </div>
            <div className="field">
              <label>{t("Status")}</label>
              <select value={entry.status} onChange={onEntryChange("status")}> 
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {t(status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button className="ghost" type="button" onClick={onEntryReset}>
                {t("Clear")}
              </button>
              <button className="action-pill" type="submit">
                {t("Save Entry")}
              </button>
            </div>
          </form>
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Expense Log")}</h3>
              <p className="panel-subtitle">{t("Latest manual entries saved in the database.")}</p>
            </div>
          </div>
          {entryState.loading ? (
            <div className="empty-state">{t("Loading entries…")}</div>
          ) : entryState.error ? (
            <div className="empty-state error">{entryState.error}</div>
          ) : filteredEntries.length === 0 ? (
            <div className="empty-state">{t("No entries yet. Add your first expense above.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    <th>{t("Date")}</th>
                    <th>{t("Country")}</th>
                    <th>{t("Category")}</th>
                    <th>{t("Reference")}</th>
                    <th>{t("Billing type")}</th>
                    <th>{t("Network")}</th>
                    <th>{t("TX Hash")}</th>
                    <th>{t("Amount (USD)")}</th>
                    <th>{t("Status")}</th>
                    {canManageExpenses ? <th>{t("Actions")}</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date}</td>
                      <td>{row.country}</td>
                      <td>{t(row.category)}</td>
                      <td>{row.reference || "—"}</td>
                      <td>{t(row.billing_type)}</td>
                      <td>{row.billing_type === "Crypto" ? row.crypto_network || "—" : "—"}</td>
                      <td className="hash-cell">
                        {row.billing_type === "Crypto" ? row.crypto_hash || "—" : "—"}
                      </td>
                      <td className="amount-cell">{formatCurrency(row.amount)}</td>
                      <td>
                        {canManageExpenses ? (
                          <select
                            className={`inline-select status-select status-${row.status.toLowerCase()}`}
                            value={row.status}
                            onChange={(event) => onEntryStatusChange?.(row.id, event.target.value)}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {t(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`status-pill status-${row.status.toLowerCase()}`}>
                            {t(row.status)}
                          </span>
                        )}
                      </td>
                      {canManageExpenses ? (
                        <td className="action-cell">
                          <button
                            className="ghost small-btn"
                            type="button"
                            onClick={() => onEntryStatusChange?.(row.id, "Cancelled")}
                            disabled={String(row.status).toLowerCase() === "cancelled"}
                          >
                            {t("Cancel")}
                          </button>
                          <button
                            className="icon-btn danger"
                            type="button"
                            onClick={() => onEntryDelete?.(row.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>

      <section className="panels finance-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Monthly Expenses")}</h3>
              <p className="panel-subtitle">{t("Total spend and monthly trend.")}</p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="chart chart-surface">
            <div className="chart-summary">
              <div>
                <p className="summary-label">{t("Total spend")}</p>
                <p className="summary-value">{formatCurrency(totalSpend)}</p>
              </div>
              <div>
                <p className="summary-label">{t("Average / month")}</p>
                <p className="summary-value">{formatCurrency(avgSpend)}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={financeTrendData} margin={{ top: 12, right: 16, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(100, 184, 255, 0.6)" />
                    <stop offset="100%" stopColor="rgba(100, 184, 255, 0)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatAxis}
                  width={44}
                  tick={{ fontSize: 11 }}
                  tickMargin={6}
                  allowDecimals={false}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="var(--blue)"
                  strokeWidth={2.2}
                  fill="url(#totalGlow)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Category Breakdown")}</h3>
              <p className="panel-subtitle">{t("Spend distribution across categories.")}</p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={financeTrendData} barCategoryGap="24%">
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="#7f848f"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatAxis}
                  width={32}
                  tick={{ fontSize: 11 }}
                  tickMargin={6}
                  allowDecimals={false}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Bar dataKey="traffic" name="Traffic Source" stackId="a" fill="var(--blue)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="tools" name="Tools" stackId="a" fill="var(--purple)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="designs" name="Designs" stackId="a" fill="var(--green)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="legend">
              <span className="legend-item">
                <span className="dot" style={{ background: "var(--blue)" }} />
                Traffic Source
              </span>
              <span className="legend-item">
                <span className="dot" style={{ background: "var(--purple)" }} />
                Tools
              </span>
              <span className="legend-item">
                <span className="dot" style={{ background: "var(--green)" }} />
                Designs
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Billing Type Mix")}</h3>
              <p className="panel-subtitle">{t("Share of spend by payment method.")}</p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="chart chart-surface chart-center">
            {billingTotalSpend > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={billingMixData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={92}
                      paddingAngle={4}
                      cornerRadius={10}
                      stroke="rgba(12, 14, 17, 0.9)"
                      strokeWidth={2}
                    >
                      {billingMixData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ShareTooltip />} wrapperStyle={{ zIndex: 40 }} cursor={false} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="legend">
                  {billingMixData.map((item) => (
                    <span className="legend-item" key={item.name}>
                      <span className="dot" style={{ background: item.color }} />
                      {t(item.name)}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">{t("No billing mix data for selected period.")}</div>
            )}
          </div>
        </motion.div>
      </section>

    </>
  );
}

function UtmBuilder() {
  const [utm, setUtm] = React.useState({
    domain: "",
    fbp: "",
    subs: Array.from({ length: 15 }, () => ""),
  });
  const [copyState, setCopyState] = React.useState("idle");
  const [utmHistory, setUtmHistory] = React.useState([]);

  const updateUtm = (key) => (event) => {
    setUtm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const updateSub = (index) => (event) => {
    const value = event.target.value;
    setUtm((prev) => {
      const nextSubs = [...prev.subs];
      nextSubs[index] = value;
      return { ...prev, subs: nextSubs };
    });
  };

  const resetUtm = () => {
    setUtm({
      domain: "",
      fbp: "",
      subs: Array.from({ length: 15 }, () => ""),
    });
    setCopyState("idle");
  };

  const encodeParamValue = (value) => {
    const encoded = encodeURIComponent(String(value));
    return encoded.replace(/%7B/gi, "{").replace(/%7D/gi, "}");
  };

  const buildQueryString = (url) => {
    const params = [];
    url.searchParams.forEach((value, key) => {
      params.push(`${encodeURIComponent(key)}=${encodeParamValue(value)}`);
    });
    if (utm.fbp) {
      params.push(`fbp=${encodeParamValue(utm.fbp)}`);
    }
    utm.subs.forEach((value, index) => {
      if (value) {
        params.push(`sub${index + 1}=${encodeParamValue(value)}`);
      }
    });
    return params.join("&");
  };

  const buildUrl = () => {
    if (!utm.domain) return "";
    try {
      const url = new URL(utm.domain);
      const query = buildQueryString(url);
      const base = `${url.origin}${url.pathname}`;
      const hash = url.hash || "";
      return query ? `${base}?${query}${hash}` : `${base}${hash}`;
    } catch (error) {
      try {
        const sanitized = utm.domain.startsWith("http")
          ? utm.domain
          : `https://${utm.domain}`;
        const url = new URL(sanitized);
        const query = buildQueryString(url);
        const base = `${url.origin}${url.pathname}`;
        const hash = url.hash || "";
        return query ? `${base}?${query}${hash}` : `${base}${hash}`;
      } catch {
        return utm.domain;
      }
    }
  };

  const utmUrl = buildUrl();
  const isValid = utm.domain ? utmUrl.startsWith("http") : true;

  const storeHistory = () => {
    if (!utmUrl || !isValid) return;
    setUtmHistory((prev) => {
      const next = [utmUrl, ...prev.filter((item) => item !== utmUrl)];
      return next.slice(0, 8);
    });
  };

  const handleClear = () => {
    resetUtm();
  };

  const handleCopy = async () => {
    if (!utmUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(utmUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = utmUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopyState("copied");
      storeHistory();
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 1500);
    }
  };

  return (
    <>
      <section className="form-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">UTM Builder</h3>
              <p className="panel-subtitle">
                Generate clean tracking links for campaigns and media buyers.
              </p>
            </div>
          </div>

          <div className="utm-grid">
            <div className="field">
              <label>Domain</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={utm.domain}
                onChange={updateUtm("domain")}
              />
            </div>
            <div className="field">
              <label>fbp</label>
              <input
                type="text"
                placeholder="facebook_pixel_id"
                value={utm.fbp}
                onChange={updateUtm("fbp")}
              />
            </div>
            {utm.subs.map((value, index) => (
              <div className="field" key={`sub-${index}`}>
                <label>{`sub${index + 1}`}</label>
                <input
                  type="text"
                  placeholder={`sub${index + 1}`}
                  value={value}
                  onChange={updateSub(index)}
                />
              </div>
            ))}
          </div>

          <div className="utm-preview">
            <div>
              <p className="summary-label">Generated URL</p>
              <p className={`utm-url ${utmUrl ? "" : "is-empty"} ${isValid ? "" : "is-invalid"}`}>
                {utmUrl || "Add a domain to generate a link."}
              </p>
            </div>
            <div className="utm-actions">
              <button className="ghost" type="button" onClick={resetUtm}>
                <RotateCcw size={16} />
                Reset
              </button>
              <button className="ghost" type="button" onClick={handleClear}>
                <X size={16} />
                Clear Fields
              </button>
              <button className="ghost" type="button" onClick={handleCopy} disabled={!utmUrl}>
                <Copy size={16} />
                {copyState === "copied" ? "Copied" : "Copy URL"}
              </button>
              <a
                className={`action-pill ${utmUrl ? "" : "is-disabled"}`}
                href={utmUrl || "#"}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => {
                  if (!utmUrl) event.preventDefault();
                }}
                onClickCapture={storeHistory}
              >
                <Link2 size={16} />
                Open
              </a>
            </div>
          </div>

          <div className="utm-history">
            <div className="custom-head">
              <p>Recent UTM links</p>
              <button className="ghost" type="button" onClick={() => setUtmHistory([])}>
                Clear list
              </button>
            </div>
            {utmHistory.length === 0 ? (
              <p className="empty-state">No generated links yet.</p>
            ) : (
              <ul className="utm-history-list">
                {utmHistory.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                    <button className="ghost" type="button" onClick={() => navigator.clipboard?.writeText(item)}>
                      <Copy size={14} />
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </section>
    </>
  );
}

function StatisticsDashboard({ authUser, viewerBuyer, filters }) {
  const isLeadership = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const effectiveBuyer = viewerBuyer || authUser?.username || "DeusInsta";
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const [statsForm, setStatsForm] = React.useState({
    date: "2026-02-07",
    buyer: effectiveBuyer,
    country: "Brazil",
    spend: "",
    clicks: "",
    installs: "",
    registers: "",
    ftds: "",
  });
  const [statsEntries, setStatsEntries] = React.useState([]);
  const [statsState, setStatsState] = React.useState({ loading: true, error: null });
  const [buyerFilter, setBuyerFilter] = React.useState(isLeadership ? "All" : effectiveBuyer);
  const [showAllStatsRows, setShowAllStatsRows] = React.useState(false);

  const updateStatsForm = (key) => (event) => {
    setStatsForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetStatsForm = () => {
    setStatsForm({
      date: "2026-02-07",
      buyer: effectiveBuyer,
      country: "Brazil",
      spend: "",
      clicks: "",
      installs: "",
      registers: "",
      ftds: "",
    });
  };

  React.useEffect(() => {
    if (!isLeadership && effectiveBuyer) {
      setStatsForm((prev) => ({ ...prev, buyer: effectiveBuyer }));
      setBuyerFilter(effectiveBuyer);
    }
  }, [effectiveBuyer, isLeadership]);

  const fetchStats = React.useCallback(async () => {
    try {
      setStatsState({ loading: true, error: null });
      const response = await apiFetch("/api/media-stats?limit=100000");
      if (!response.ok) {
        throw new Error("Failed to load media buyer stats.");
      }
      const data = await response.json();
      setStatsEntries(data);
      setStatsState({ loading: false, error: null });
    } catch (error) {
      setStatsState({ loading: false, error: error.message || "Failed to load stats." });
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchStats]);

  const handleStatsSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/media-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(statsForm),
      });
      if (!response.ok) {
        throw new Error("Failed to save stats entry.");
      }
      await fetchStats();
      resetStatsForm();
    } catch (error) {
      setStatsState({ loading: false, error: error.message || "Failed to save stats entry." });
    }
  };

  const sum = (value) => Number(value || 0);

  const normalizedEntries = React.useMemo(() => {
    const map = new Map();
    statsEntries.forEach((row) => {
      const date = String(row.date || "");
      const buyer = String(row.buyer || "");
      const country = String(row.country || "");
      const key = `${date}|${buyer}|${country}`;
      if (!map.has(key)) {
        map.set(key, {
          id: row.id,
          date,
          buyer,
          country,
          spend: 0,
          clicks: 0,
          installs: 0,
          registers: 0,
          ftds: 0,
        });
      }
      const current = map.get(key);
      current.spend += sum(row.spend);
      current.clicks += sum(row.clicks);
      current.installs += sum(row.installs);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      if (!current.id && row.id) current.id = row.id;
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateSort = String(b.date || "").localeCompare(String(a.date || ""));
      if (dateSort !== 0) return dateSort;
      return (b.id || 0) - (a.id || 0);
    });
  }, [statsEntries]);

  const buyers = isLeadership
    ? Array.from(
        new Set(["All", ...buyerOptions, ...normalizedEntries.map((row) => row.buyer).filter(Boolean)])
      )
    : [effectiveBuyer].filter(Boolean);
  const filteredEntries = normalizedEntries.filter((row) => {
    if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
      return false;
    }
    if (
      isLeadership &&
      !isAllSelection(buyerFilter) &&
      !String(row.buyer || "").toLowerCase().includes(String(buyerFilter).toLowerCase())
    ) {
      return false;
    }
    if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
    if (!isDateInRange(row.date, globalDateRange)) return false;
    return true;
  });

  React.useEffect(() => {
    setShowAllStatsRows(false);
  }, [buyerFilter, globalBuyerFilter, globalCountryFilter, globalDateRange.from, globalDateRange.to]);

  const safeDivide = (num, denom) => (denom > 0 ? num / denom : null);
  const toPercent = (num, denom) => {
    const value = safeDivide(num, denom);
    return value === null ? null : value * 100;
  };
  const toCost = (spend, denom) => {
    if (!spend || spend <= 0) return null;
    const value = safeDivide(spend, denom);
    return value === null ? null : value;
  };
  const fmtPercent = (value) =>
    value === null || Number.isNaN(value) ? "—" : `${value.toFixed(2)}%`;
  const fmtCost = (value) =>
    value === null || Number.isNaN(value) ? "—" : formatCurrency(value);

  const totals = filteredEntries.reduce(
    (acc, row) => ({
      spend: acc.spend + sum(row.spend),
      clicks: acc.clicks + sum(row.clicks),
      installs: acc.installs + sum(row.installs),
      registers: acc.registers + sum(row.registers),
      ftds: acc.ftds + sum(row.ftds),
    }),
    { spend: 0, clicks: 0, installs: 0, registers: 0, ftds: 0 }
  );

  const chartMap = new Map();
  filteredEntries.forEach((row) => {
    const key = row.date;
    if (!chartMap.has(key)) {
      chartMap.set(key, {
        date: key,
        spend: 0,
        clicks: 0,
        installs: 0,
        registers: 0,
        ftds: 0,
      });
    }
    const current = chartMap.get(key);
    current.spend += sum(row.spend);
    current.clicks += sum(row.clicks);
    current.installs += sum(row.installs);
    current.registers += sum(row.registers);
    current.ftds += sum(row.ftds);
  });

  const chartData = Array.from(chartMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      ...row,
      c2i: toPercent(row.installs, row.clicks),
      c2r: toPercent(row.registers, row.clicks),
      c2f: toPercent(row.ftds, row.clicks),
      r2d: toPercent(row.ftds, row.registers),
      cpc: toCost(row.spend, row.clicks),
      cpr: toCost(row.spend, row.registers),
      cpp: toCost(row.spend, row.ftds),
    }));

  const volumeMax = Math.max(
    0,
    ...chartData.map((row) => Math.max(row.clicks || 0, row.registers || 0, row.ftds || 0))
  );
  const rateMax = Math.max(
    0,
    ...chartData.map((row) => Math.max(row.c2r || 0, row.r2d || 0, row.c2f || 0))
  );
  const costMax = Math.max(
    0,
    ...chartData.map((row) => Math.max(row.cpc || 0, row.cpr || 0, row.cpp || 0))
  );

  const volumeDomainMax = volumeMax > 0 ? Math.ceil(volumeMax * 1.15) : 10;
  const rateDomainMax = Math.min(100, Math.max(10, Math.ceil((rateMax || 0) / 5) * 5));
  const costDomainMax = costMax > 0 ? Math.ceil(costMax * 1.2) : 10;
  const rankedEntries = React.useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      const ftdDiff = sum(b.ftds) - sum(a.ftds);
      if (ftdDiff !== 0) return ftdDiff;
      const regDiff = sum(b.registers) - sum(a.registers);
      if (regDiff !== 0) return regDiff;
      const clickDiff = sum(b.clicks) - sum(a.clicks);
      if (clickDiff !== 0) return clickDiff;
      const spendDiff = sum(b.spend) - sum(a.spend);
      if (spendDiff !== 0) return spendDiff;
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
  }, [filteredEntries]);
  const visibleEntries = showAllStatsRows ? rankedEntries : rankedEntries.slice(0, 10);

  return (
    <>
      <section className="cards">
        {[ 
          { label: "Total Spend", value: fmtCost(totals.spend), meta: "Filtered view" },
          { label: "Total Clicks", value: totals.clicks.toLocaleString(), meta: "Filtered view" },
          { label: "Total Registers", value: totals.registers.toLocaleString(), meta: "Filtered view" },
          { label: "Total FTDs", value: totals.ftds.toLocaleString(), meta: "Filtered view" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
          >
            <div className="card-head">{stat.label}</div>
            <div className="card-value">{stat.value}</div>
            <div className="card-meta">{stat.meta}</div>
          </motion.div>
        ))}
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Media Buyer Funnel Log</h3>
              <p className="panel-subtitle">Calculated funnel metrics per entry.</p>
            </div>
            {isLeadership ? (
              <select
                className="select"
                value={buyerFilter}
                onChange={(e) => setBuyerFilter(e.target.value)}
              >
                {buyers.map((buyer) => (
                  <option key={buyer}>{buyer}</option>
                ))}
              </select>
            ) : (
              <div className="select select-static">{effectiveBuyer}</div>
            )}
          </div>

          {statsState.loading ? (
            <div className="empty-state">Loading entries…</div>
          ) : statsState.error ? (
            <div className="empty-state error">{statsState.error}</div>
          ) : filteredEntries.length === 0 ? (
            <div className="empty-state">No entries yet. Add your first stats row above.</div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="entries-table stats-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Buyer</th>
                      <th>Country</th>
                      <th>Spend</th>
                      <th>Clicks</th>
                      <th>Installs</th>
                      <th>Registers</th>
                      <th>FTDs</th>
                      <th>C2I</th>
                      <th>C2R</th>
                      <th>C2FTD</th>
                      <th>R2D</th>
                      <th>CPC</th>
                      <th>CPI</th>
                      <th>CPR</th>
                      <th>CPP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEntries.map((row) => {
                      const spend = sum(row.spend);
                      const clicks = sum(row.clicks);
                      const installs = sum(row.installs);
                      const registers = sum(row.registers);
                      const ftds = sum(row.ftds);
                      const c2i = toPercent(installs, clicks);
                      const c2r = toPercent(registers, clicks);
                      const c2f = toPercent(ftds, clicks);
                      const r2d = toPercent(ftds, registers);
                      const cpc = toCost(spend, clicks);
                      const cpi = toCost(spend, installs);
                      const cpr = toCost(spend, registers);
                      const cpp = toCost(spend, ftds);

                      return (
                        <tr key={`${row.id || "stat"}-${row.date}-${row.buyer}-${row.country || ""}`}>
                          <td>{row.date}</td>
                          <td>{row.buyer}</td>
                          <td>{row.country || "—"}</td>
                          <td>{spend ? formatCurrency(spend) : "—"}</td>
                          <td>{clicks.toLocaleString()}</td>
                          <td>{installs ? installs.toLocaleString() : "—"}</td>
                          <td>{registers.toLocaleString()}</td>
                          <td>{ftds.toLocaleString()}</td>
                          <td>{fmtPercent(c2i)}</td>
                          <td>{fmtPercent(c2r)}</td>
                          <td>{fmtPercent(c2f)}</td>
                          <td>{fmtPercent(r2d)}</td>
                          <td>{fmtCost(cpc)}</td>
                          <td>{fmtCost(cpi)}</td>
                          <td>{fmtCost(cpr)}</td>
                          <td>{fmtCost(cpp)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rankedEntries.length > 10 ? (
                <div className="api-actions" style={{ marginTop: 10 }}>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => setShowAllStatsRows((prev) => !prev)}
                  >
                    {showAllStatsRows ? "Show Less" : "See More"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </motion.div>
      </section>

      <section className="panels stats-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Volume Trend</h3>
              <p className="panel-subtitle">Clicks, registers, and FTDs over time.</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={chartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="statsVolumeClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  tickMargin={10}
                  minTickGap={16}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={axisTickStyle}
                  domain={[0, volumeDomainMax]}
                  tickFormatter={formatVolumeAxis}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatShortDate}
                  formatter={(value, name) => [value?.toLocaleString?.() ?? value, name]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="var(--blue)"
                  strokeWidth={2}
                  fill="url(#statsVolumeClicks)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="registers"
                  name="Registers"
                  stroke="var(--purple)"
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="ftds"
                  name="FTDs"
                  stroke="var(--green)"
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Funnel Rates</h3>
              <p className="panel-subtitle">Conversion rates per day.</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="statsRateC2R" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="statsRateR2D" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="statsRateC2F" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--orange)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  tickMargin={10}
                  minTickGap={16}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={axisTickStyle}
                  domain={[0, rateDomainMax]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatShortDate}
                  formatter={(value, name) => [fmtPercent(value), name]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="c2r"
                  name="Click2Register"
                  stroke="var(--purple)"
                  strokeWidth={2}
                  fill="url(#statsRateC2R)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="r2d"
                  name="Reg2Dep"
                  stroke="var(--green)"
                  strokeWidth={2}
                  fill="url(#statsRateR2D)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="c2f"
                  name="Click2FTD"
                  stroke="var(--orange)"
                  strokeWidth={2}
                  fill="url(#statsRateC2F)"
                  connectNulls
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f1217" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Cost Metrics</h3>
              <p className="panel-subtitle">Cost per click, register, and FTD.</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 24, left: 4, bottom: 4 }}
                barCategoryGap={18}
                barGap={6}
              >
                <defs>
                  <linearGradient id="statsCostCpc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.25} />
                  </linearGradient>
                  <linearGradient id="statsCostCpr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.25} />
                  </linearGradient>
                  <linearGradient id="statsCostCpp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  tickMargin={10}
                  minTickGap={16}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  tick={axisTickStyle}
                  domain={[0, costDomainMax]}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatShortDate}
                  formatter={(value, name) => [fmtCost(value), name]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }}
                />
                <Bar dataKey="cpc" name="CPC" fill="url(#statsCostCpc)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                <Bar dataKey="cpr" name="CPR" fill="url(#statsCostCpr)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                <Bar dataKey="cpp" name="CPP" fill="url(#statsCostCpp)" radius={[8, 8, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>
    </>
  );
}

function PlacementsDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [placementEntries, setPlacementEntries] = React.useState([]);
  const [placementState, setPlacementState] = React.useState({ loading: true, error: null });
  const [placementFilter, setPlacementFilter] = React.useState("All placements");

  const fetchPlacements = React.useCallback(async () => {
    try {
      setPlacementState({ loading: true, error: null });
      const response = await apiFetch("/api/media-stats?limit=100000");
      if (!response.ok) {
        throw new Error("Failed to load placement stats.");
      }
      const data = await response.json();
      setPlacementEntries(Array.isArray(data) ? data : []);
      setPlacementState({ loading: false, error: null });
    } catch (error) {
      setPlacementState({ loading: false, error: error.message || "Failed to load placement stats." });
    }
  }, []);

  React.useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchPlacements();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchPlacements]);

  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveDateRange =
    globalDateRange.from || globalDateRange.to ? globalDateRange : periodRange;
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";
  const sum = (value) => Number(value || 0);
  const normalizePlacementLabel = React.useCallback((value) => {
    const rawPlacement = String(value || "").trim();
    const normalizedPlacement = rawPlacement
      .replace(/^[({\[]?sub[_\s-]*id[_\s-]*1[)\]}]?$/i, "")
      .replace(/^[({\[]?sub[_\s-]*1[)\]}]?$/i, "")
      .trim();
    if (!normalizedPlacement) return "";
    return normalizedPlacement.replace(/_/g, " ");
  }, []);
  const placementRows = React.useMemo(() => {
    return placementEntries.filter((row) => {
      if (!isDateInRange(row.date, effectiveDateRange)) return false;
      if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
        return false;
      }
      if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
      return true;
    });
  }, [
    placementEntries,
    effectiveDateRange.from,
    effectiveDateRange.to,
    globalBuyerFilter,
    globalCountryFilter,
    effectiveBuyer,
    isLeadership,
  ]);

  const placementOptions = React.useMemo(() => {
    const options = new Set();
    placementRows.forEach((row) => {
      const label = normalizePlacementLabel(row.placement);
      if (label) options.add(label);
    });
    return ["All placements", ...Array.from(options).sort((a, b) => a.localeCompare(b))];
  }, [placementRows, normalizePlacementLabel]);

  React.useEffect(() => {
    if (!placementOptions.includes(placementFilter)) {
      setPlacementFilter("All placements");
    }
  }, [placementOptions, placementFilter]);

  const placementData = React.useMemo(() => {
    const map = new Map();
    placementRows.forEach((row) => {
      const placement = normalizePlacementLabel(row.placement);
      if (!placement) return;
      if (!map.has(placement)) {
        map.set(placement, {
          placement,
          clicks: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          revenue: 0,
          spend: 0,
        });
      }
      const current = map.get(placement);
      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.revenue += sum(row.revenue);
      current.spend += sum(row.spend);
    });

    return Array.from(map.values())
      .map((row) => {
        const clickToReg = row.clicks > 0 ? (row.registers / row.clicks) * 100 : 0;
        const regToFtd = row.registers > 0 ? (row.ftds / row.registers) * 100 : 0;
        const ftdToRedeposit = row.ftds > 0 ? (row.redeposits / row.ftds) * 100 : 0;
        const epc = row.clicks > 0 ? row.revenue / row.clicks : 0;
        return {
          ...row,
          clickToReg,
          regToFtd,
          ftdToRedeposit,
          epc,
        };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }, [placementRows, normalizePlacementLabel]);

  const activePlacementData = React.useMemo(() => {
    if (placementFilter === "All placements") return placementData;
    return placementData.filter((row) => row.placement === placementFilter);
  }, [placementData, placementFilter]);

  const totals = activePlacementData.reduce(
    (acc, row) => ({
      clicks: acc.clicks + row.clicks,
      registers: acc.registers + row.registers,
      ftds: acc.ftds + row.ftds,
      revenue: acc.revenue + row.revenue,
    }),
    { clicks: 0, registers: 0, ftds: 0, revenue: 0 }
  );

  const topByClicks = activePlacementData[0] || null;
  const topByRevenue = [...activePlacementData].sort((a, b) => b.revenue - a.revenue)[0] || null;
  const topByCr = [...activePlacementData].sort((a, b) => b.regToFtd - a.regToFtd)[0] || null;
  const topChartRows = activePlacementData.slice(0, 10);
  const topRevenueRows = [...activePlacementData].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const clicksMax = Math.max(
    10,
    ...topChartRows.map((row) => Math.max(row.clicks || 0, row.registers || 0))
  );
  const revenueMax = Math.max(10, ...topRevenueRows.map((row) => row.revenue || 0));

  const fmtPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

  return (
    <>
      <section className="cards">
        {[
          {
            label: "Tracked Placements",
            value: placementData.length.toLocaleString(),
            meta: period === "All" ? "All time" : period,
          },
          {
            label: "Top Placement by Clicks",
            value: topByClicks?.placement || "—",
            meta: topByClicks ? `${topByClicks.clicks.toLocaleString()} clicks` : "No data",
          },
          {
            label: "Top Placement by Revenue",
            value: topByRevenue?.placement || "—",
            meta: topByRevenue ? formatCurrency(topByRevenue.revenue) : "No data",
          },
          {
            label: "Best Reg2FTD Placement",
            value: topByCr?.placement || "—",
            meta: topByCr ? fmtPercent(topByCr.regToFtd) : "No data",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
          >
            <div className="card-head">{t(stat.label)}</div>
            <div className="card-value">{stat.value}</div>
            <div className="card-meta">{t(stat.meta)}</div>
          </motion.div>
        ))}
      </section>

      <section className="panels device-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Placement Volume")}</h3>
              <p className="panel-subtitle">{t("Clicks and registers grouped by sub_id_1 placement.")}</p>
            </div>
            <div className="panel-actions">
              <select
                className="inline-select"
                value={placementFilter}
                onChange={(event) => setPlacementFilter(event.target.value)}
              >
                {placementOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "All placements" ? t(option) : option}
                  </option>
                ))}
              </select>
              <PeriodSelect
                value={period}
                onChange={setPeriod}
                customRange={customRange}
                onCustomChange={onCustomChange}
              />
            </div>
          </div>
          {placementState.loading ? (
            <div className="empty-state">{t("Loading placement stats…")}</div>
          ) : placementState.error ? (
            <div className="empty-state error">{placementState.error}</div>
          ) : topChartRows.length === 0 ? (
            <div className="empty-state">
              {t("No placement data yet. Sync Keitaro with sub_id_1 in dimensions and placementField mapping.")}
            </div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topChartRows} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="placementClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.25} />
                    </linearGradient>
                    <linearGradient id="placementRegs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="placement" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    domain={[0, Math.ceil(clicksMax * 1.15)]}
                    tickFormatter={(value) => Number(value || 0).toLocaleString()}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [Number(value || 0).toLocaleString(), name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Bar dataKey="clicks" name={t("Clicks")} fill="url(#placementClicks)" radius={[8, 8, 0, 0]} />
                  <Bar
                    dataKey="registers"
                    name={t("Registers")}
                    fill="url(#placementRegs)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Revenue by Placement")}</h3>
              <p className="panel-subtitle">{t("Revenue contribution by top placements.")}</p>
            </div>
          </div>
          {topRevenueRows.length === 0 ? (
            <div className="empty-state">{t("No revenue data available.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topRevenueRows}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 110, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="placementRevenue" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    domain={[0, Math.ceil(revenueMax * 1.15)]}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis
                    type="category"
                    dataKey="placement"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatCurrency(value), t("Revenue")]}
                  />
                  <Bar dataKey="revenue" fill="url(#placementRevenue)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel span-2 placement-conversion"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Placement Conversion Rates")}</h3>
              <p className="panel-subtitle">{t("Click2Reg, Reg2FTD, and FTD2Redeposit rates.")}</p>
            </div>
          </div>
          {topChartRows.length === 0 ? (
            <div className="empty-state">{t("No conversion rate data available.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={topChartRows} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="placement" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [fmtPercent(value), name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Line type="monotone" dataKey="clickToReg" name="Click2Reg" stroke="var(--blue)" strokeWidth={2} />
                  <Line type="monotone" dataKey="regToFtd" name="Reg2FTD" stroke="var(--green)" strokeWidth={2} />
                  <Line
                    type="monotone"
                    dataKey="ftdToRedeposit"
                    name="FTD2Redeposit"
                    stroke="var(--orange)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Placement Breakdown")}</h3>
              <p className="panel-subtitle">{t("Detailed performance by placement (sub_id_1).")}</p>
            </div>
            <div className="summary-inline">
              <span>{t("Clicks")}: {totals.clicks.toLocaleString()}</span>
              <span>{t("Registers")}: {totals.registers.toLocaleString()}</span>
              <span>{t("FTDs")}: {totals.ftds.toLocaleString()}</span>
              <span>{t("Revenue")}: {formatCurrency(totals.revenue)}</span>
            </div>
          </div>

          {placementState.loading ? (
            <div className="empty-state">{t("Loading placement stats…")}</div>
          ) : placementState.error ? (
            <div className="empty-state error">{placementState.error}</div>
          ) : activePlacementData.length === 0 ? (
            <div className="empty-state">
              {t("No placement rows found. Check Keitaro payload dimensions and mapping for sub_id_1.")}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    <th>{t("Placement")}</th>
                    <th>{t("Clicks")}</th>
                    <th>{t("Registers")}</th>
                    <th>{t("FTDs")}</th>
                    <th>{t("Redeposits")}</th>
                    <th>{t("Revenue")}</th>
                    <th>{t("Click2Reg")}</th>
                    <th>{t("Reg2FTD")}</th>
                    <th>{t("FTD2Redeposit")}</th>
                    <th>{t("EPC")}</th>
                  </tr>
                </thead>
                <tbody>
                  {activePlacementData.map((row) => (
                    <tr key={row.placement}>
                      <td>{row.placement}</td>
                      <td>{row.clicks.toLocaleString()}</td>
                      <td>{row.registers.toLocaleString()}</td>
                      <td>{row.ftds.toLocaleString()}</td>
                      <td>{row.redeposits.toLocaleString()}</td>
                      <td>{formatCurrency(row.revenue)}</td>
                      <td>{fmtPercent(row.clickToReg)}</td>
                      <td>{fmtPercent(row.regToFtd)}</td>
                      <td>{fmtPercent(row.ftdToRedeposit)}</td>
                      <td>{formatCurrency(row.epc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

function CampaignsDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [campaignEntries, setCampaignEntries] = React.useState([]);
  const [registeredDomains, setRegisteredDomains] = React.useState([]);
  const [campaignMappings, setCampaignMappings] = React.useState([]);
  const [campaignState, setCampaignState] = React.useState({ loading: true, error: null });
  const [buyerFilter, setBuyerFilter] = React.useState("All buyers");
  const [domainFilter, setDomainFilter] = React.useState("All domains");
  const sum = (value) => Number(value || 0);
  const normalizeText = (value) => String(value || "").trim();
  const normalizeDomain = (value) => {
    const text = normalizeText(value);
    if (!text) return "";
    const withoutProtocol = text.replace(/^https?:\/\//i, "");
    return withoutProtocol.split("/")[0].trim().toLowerCase();
  };
  const toDomainKey = (value) => normalizeDomain(value).replace(/^www\./i, "");

  const registeredDomainMap = React.useMemo(() => {
    const map = new Map();
    registeredDomains.forEach((domain) => {
      const key = toDomainKey(domain);
      if (key && !map.has(key)) {
        map.set(key, domain);
      }
    });
    return map;
  }, [registeredDomains]);

  const resolveRegisteredDomain = React.useCallback(
    (value) => {
      const key = toDomainKey(value);
      if (!key) return "";
      if (registeredDomainMap.has(key)) {
        return registeredDomainMap.get(key) || "";
      }
      for (const [registeredKey, registeredValue] of registeredDomainMap.entries()) {
        if (key.endsWith(`.${registeredKey}`) || registeredKey.endsWith(`.${key}`)) {
          return registeredValue;
        }
      }
      return "";
    },
    [registeredDomainMap]
  );

  const normalizeCampaignKey = React.useCallback(
    (value) => normalizeText(value).toLowerCase().replace(/\s+/g, " ").trim(),
    []
  );

  const campaignDomainLookup = React.useMemo(() => {
    const byCampaign = new Map();
    const byBuyer = new Map();

    campaignMappings.forEach((row) => {
      const campaignKey = normalizeCampaignKey(row?.name);
      const buyerKey = normalizeCampaignKey(row?.buyer);
      const domainValue = normalizeDomain(row?.domain);
      if (!domainValue) return;

      if (campaignKey && !byCampaign.has(campaignKey)) {
        byCampaign.set(campaignKey, domainValue);
      }
      if (buyerKey) {
        if (!byBuyer.has(buyerKey)) {
          byBuyer.set(buyerKey, new Set());
        }
        byBuyer.get(buyerKey).add(domainValue);
      }
    });

    return { byCampaign, byBuyer };
  }, [campaignMappings, normalizeCampaignKey]);

  const resolveMappedDomain = React.useCallback(
    (campaignValue, buyerValue) => {
      const campaignKey = normalizeCampaignKey(campaignValue);
      if (campaignKey && campaignDomainLookup.byCampaign.has(campaignKey)) {
        return campaignDomainLookup.byCampaign.get(campaignKey) || "";
      }

      const buyerKey = normalizeCampaignKey(buyerValue);
      if (!buyerKey) return "";
      const domains = campaignDomainLookup.byBuyer.get(buyerKey);
      if (!domains || domains.size !== 1) return "";
      return Array.from(domains)[0] || "";
    },
    [campaignDomainLookup, normalizeCampaignKey]
  );

  const fetchCampaigns = React.useCallback(async () => {
    try {
      setCampaignState({ loading: true, error: null });
      const [statsResponse, domainsResponse, mappingsResponse] = await Promise.all([
        apiFetch("/api/media-stats?limit=100000"),
        apiFetch("/api/domains?limit=500"),
        apiFetch("/api/campaigns?limit=500"),
      ]);

      if (!statsResponse.ok) {
        throw new Error("Failed to load campaign stats.");
      }
      const data = await statsResponse.json();
      setCampaignEntries(Array.isArray(data) ? data : []);

      if (domainsResponse.ok) {
        const domainsData = await domainsResponse.json();
        const normalized = Array.isArray(domainsData)
          ? Array.from(
              new Set(
                domainsData
                  .map((row) => normalizeDomain(row?.domain))
                  .filter(Boolean)
              )
            ).sort((a, b) => a.localeCompare(b))
          : [];
        setRegisteredDomains(normalized);
      } else {
        setRegisteredDomains([]);
      }

      if (mappingsResponse.ok) {
        const mappingsData = await mappingsResponse.json();
        setCampaignMappings(Array.isArray(mappingsData) ? mappingsData : []);
      } else {
        setCampaignMappings([]);
      }
      setCampaignState({ loading: false, error: null });
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to load campaign stats." });
    }
  }, []);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  React.useEffect(() => {
    const handleSync = () => fetchCampaigns();
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchCampaigns]);

  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveDateRange =
    globalDateRange.from || globalDateRange.to ? globalDateRange : periodRange;
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";

  const campaignRows = React.useMemo(
    () =>
      campaignEntries
        .map((row) => {
          const domainRaw = normalizeDomain(row.domain || row.source || row.site || row.flows);
          const buyerLabel = normalizeText(row.buyer) || "Unknown buyer";
          const campaignLabel = normalizeText(row.campaign_name || row.campaign || row.buyer) || "Unknown campaign";
          const mappedDomain = resolveMappedDomain(campaignLabel, buyerLabel);
          const assignedDomain =
            resolveRegisteredDomain(domainRaw) ||
            resolveRegisteredDomain(mappedDomain) ||
            normalizeDomain(mappedDomain);
          const adsetLabel = normalizeText(row.adset_name) || "Unknown adset";
          const adLabel = normalizeText(row.ad_name) || "Unknown ad";
          const hasVolume =
            sum(row.clicks) > 0 ||
            sum(row.registers) > 0 ||
            sum(row.ftds) > 0 ||
            sum(row.redeposits) > 0;
          const hasValue = sum(row.spend) > 0 || sum(row.revenue) > 0;
          return {
            ...row,
            buyerLabel,
            domainRaw,
            mappedDomain,
            assignedDomain,
            campaignLabel,
            adsetLabel,
            adLabel,
            hasVolume,
            hasValue,
          };
        })
        .filter((row) => {
          if (!isDateInRange(row.date, effectiveDateRange)) return false;
          if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
            return false;
          }
          if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
          return Boolean(
            row.campaignLabel ||
              row.adsetLabel ||
              row.adLabel ||
              row.assignedDomain ||
              row.domainRaw ||
              row.hasVolume ||
              row.hasValue
          );
        }),
    [
      campaignEntries,
      effectiveDateRange.from,
      effectiveDateRange.to,
      globalBuyerFilter,
      globalCountryFilter,
      effectiveBuyer,
      isLeadership,
      resolveMappedDomain,
      resolveRegisteredDomain,
    ]
  );

  const buyerOptionsLocal = React.useMemo(() => {
    const values = new Set();
    campaignRows.forEach((row) => {
      const buyer = normalizeText(row.buyer);
      if (buyer) values.add(buyer);
    });
    return ["All buyers", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [campaignRows]);

  const domainOptionsLocal = React.useMemo(
    () => ["All domains", ...registeredDomains],
    [registeredDomains]
  );

  React.useEffect(() => {
    if (!buyerOptionsLocal.includes(buyerFilter)) {
      setBuyerFilter("All buyers");
    }
  }, [buyerOptionsLocal, buyerFilter]);

  React.useEffect(() => {
    if (!domainOptionsLocal.includes(domainFilter)) {
      setDomainFilter("All domains");
    }
  }, [domainOptionsLocal, domainFilter]);

  const filteredRows = React.useMemo(
    () =>
      campaignRows.filter((row) => {
        const buyer = normalizeText(row.buyer);
        const domain = toDomainKey(row.assignedDomain || row.domainRaw);
        if (buyerFilter !== "All buyers" && buyer !== buyerFilter) return false;
        if (domainFilter !== "All domains" && domain !== toDomainKey(domainFilter)) return false;
        return true;
      }),
    [campaignRows, buyerFilter, domainFilter]
  );

  const campaignAgg = React.useMemo(() => {
    const isUnknownLabel = (value) => /^unknown\b/i.test(String(value || "").trim());
    const map = new Map();
    filteredRows.forEach((row) => {
      const buyer = row.buyerLabel;
      const domain = row.assignedDomain || row.domainRaw || "unassigned.domain";
      const campaignName = row.campaignLabel;
      const adsetName = row.adsetLabel;
      const adName = row.adLabel;
      const conversions = sum(row.registers) + sum(row.ftds) + sum(row.redeposits);
      const key = `${buyer}|${domain}|${campaignName}`;

      if (!map.has(key)) {
        map.set(key, {
          buyer,
          domain,
          campaignName,
          adsetName,
          adName,
          clicks: 0,
          conversions: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          spend: 0,
          revenue: 0,
        });
      }
      const current = map.get(key);
      if (isUnknownLabel(current.adsetName) && !isUnknownLabel(adsetName)) {
        current.adsetName = adsetName;
      }
      if (isUnknownLabel(current.adName) && !isUnknownLabel(adName)) {
        current.adName = adName;
      }
      current.clicks += sum(row.clicks);
      current.conversions += conversions;
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.spend += sum(row.spend);
      current.revenue += sum(row.revenue);
    });

    return Array.from(map.values())
      .map((row) => ({
        ...row,
        cpc: row.clicks > 0 ? row.spend / row.clicks : 0,
        cpa: row.conversions > 0 ? row.spend / row.conversions : 0,
        cr: row.clicks > 0 ? (row.conversions / row.clicks) * 100 : 0,
      }))
      .sort((a, b) => b.conversions - a.conversions);
  }, [filteredRows]);

  const creativeAgg = React.useMemo(() => {
    const isUnknownLabel = (value) => /^unknown\b/i.test(String(value || "").trim());
    const map = new Map();
    filteredRows.forEach((row) => {
      const buyer = row.buyerLabel;
      const domain = row.assignedDomain || row.domainRaw || "unassigned.domain";
      const campaignName = row.campaignLabel;
      const adsetName = row.adsetLabel;
      const adName = row.adLabel;
      const conversions = sum(row.registers) + sum(row.ftds) + sum(row.redeposits);
      const key = `${buyer}|${domain}|${campaignName}|${adsetName}|${adName}`;
      if (!map.has(key)) {
        map.set(key, {
          buyer,
          domain,
          campaignName,
          adsetName,
          adName,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
        });
      }
      const current = map.get(key);
      current.clicks += sum(row.clicks);
      current.conversions += conversions;
      current.spend += sum(row.spend);
      current.revenue += sum(row.revenue);
    });

    const baseRows = Array.from(map.values())
      .map((row) => ({
        ...row,
        cpc: row.clicks > 0 ? row.spend / row.clicks : 0,
        cpa: row.conversions > 0 ? row.spend / row.conversions : 0,
        cr: row.clicks > 0 ? (row.conversions / row.clicks) * 100 : 0,
      }))
      .sort((a, b) => b.conversions - a.conversions);

    const hasNamedCreative = baseRows.some((row) => !isUnknownLabel(row.adName));
    return hasNamedCreative ? baseRows.filter((row) => !isUnknownLabel(row.adName)) : baseRows;
  }, [filteredRows]);

  const growthSeries = React.useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const date = String(row.date || "").trim();
      if (!date) return;
      if (!map.has(date)) {
        map.set(date, { date, clicks: 0, conversions: 0, spend: 0, revenue: 0 });
      }
      const current = map.get(date);
      current.clicks += sum(row.clicks);
      current.conversions += sum(row.registers) + sum(row.ftds) + sum(row.redeposits);
      current.spend += sum(row.spend);
      current.revenue += sum(row.revenue);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRows]);

  const totals = React.useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => {
          acc.clicks += sum(row.clicks);
          acc.installs += sum(row.installs);
          acc.registers += sum(row.registers);
          acc.ftds += sum(row.ftds);
          acc.conversions += sum(row.registers) + sum(row.ftds) + sum(row.redeposits);
          acc.spend += sum(row.spend);
          acc.revenue += sum(row.revenue);
          return acc;
        },
        { clicks: 0, installs: 0, registers: 0, ftds: 0, conversions: 0, spend: 0, revenue: 0 }
      ),
    [filteredRows]
  );

  const costPerClick = totals.clicks > 0 ? totals.spend / totals.clicks : null;
  const costPerInstall = totals.installs > 0 ? totals.spend / totals.installs : null;
  const costPerRegister = totals.registers > 0 ? totals.spend / totals.registers : null;
  const costPerConversion = totals.ftds > 0 ? totals.spend / totals.ftds : null;
  const costPerLead = totals.installs > 0 ? totals.spend / totals.installs : null;
  const costPerPurchase = totals.ftds > 0 ? totals.spend / totals.ftds : null;

  const topCampaign = campaignAgg[0] || null;
  const topCreative = creativeAgg[0] || null;
  const compareCampaign = campaignAgg[1] || null;
  const comparisonDelta =
    topCampaign && compareCampaign && compareCampaign.conversions > 0
      ? ((topCampaign.conversions - compareCampaign.conversions) / compareCampaign.conversions) * 100
      : null;

  const growthPercent = React.useMemo(() => {
    if (!effectiveDateRange.from || !effectiveDateRange.to) return null;
    const fromDate = new Date(`${effectiveDateRange.from}T00:00:00`);
    const toDate = new Date(`${effectiveDateRange.to}T00:00:00`);
    if (!Number.isFinite(fromDate.getTime()) || !Number.isFinite(toDate.getTime())) return null;
    const days = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1);
    const prevTo = new Date(fromDate);
    prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo);
    prevFrom.setDate(prevFrom.getDate() - (days - 1));
    const prevRange = { from: formatIsoDate(prevFrom), to: formatIsoDate(prevTo) };

    const previousClicks = campaignEntries
      .filter((row) => {
        if (!isDateInRange(row.date, prevRange)) return false;
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
          return false;
        }
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        const buyer = normalizeText(row.buyer);
        const domain = toDomainKey(
          resolveRegisteredDomain(row.domain || row.source || row.site || row.flows) ||
            normalizeDomain(row.domain || row.source || row.site || row.flows)
        );
        if (buyerFilter !== "All buyers" && buyer !== buyerFilter) return false;
        if (domainFilter !== "All domains" && domain !== toDomainKey(domainFilter)) return false;
        return true;
      })
      .reduce((sumValue, row) => sumValue + sum(row.clicks), 0);

    if (previousClicks <= 0) return null;
    return ((totals.clicks - previousClicks) / previousClicks) * 100;
  }, [
    effectiveDateRange.from,
    effectiveDateRange.to,
    campaignEntries,
    buyerFilter,
    domainFilter,
    globalBuyerFilter,
    globalCountryFilter,
    effectiveBuyer,
    isLeadership,
    resolveRegisteredDomain,
    totals.clicks,
  ]);

  const campaignChartRows = campaignAgg.slice(0, 10).map((row) => ({
    ...row,
    shortName: row.campaignName.length > 20 ? `${row.campaignName.slice(0, 20)}...` : row.campaignName,
  }));
  const creativeChartRows = creativeAgg.slice(0, 10).map((row) => ({
    ...row,
    shortName: row.adName.length > 18 ? `${row.adName.slice(0, 18)}...` : row.adName,
  }));
  const campaignTableRows = campaignAgg.slice(0, 30);

  return (
    <>
      <section className="cards">
        {[
          {
            label: "Clicks",
            value: totals.clicks.toLocaleString(),
            meta: `CPC ${costPerClick === null ? "—" : formatCurrency(costPerClick)}`,
          },
          {
            label: "Installs",
            value: totals.installs.toLocaleString(),
            meta: `Cost per Install ${costPerInstall === null ? "—" : formatCurrency(costPerInstall)}`,
          },
          {
            label: "Register",
            value: totals.registers.toLocaleString(),
            meta: `Cost per Register ${costPerRegister === null ? "—" : formatCurrency(costPerRegister)}`,
          },
          {
            label: "Conversion",
            value: totals.ftds.toLocaleString(),
            meta: `Cost per FTD ${costPerConversion === null ? "—" : formatCurrency(costPerConversion)}`,
          },
        ].map((stat, idx) => (
          <motion.div
            key={`${stat.label}-${idx}`}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
          >
            <div className="card-head">{t(stat.label)}</div>
            <div className="card-value">{stat.value}</div>
            <div className="card-meta">{t(stat.meta)}</div>
          </motion.div>
        ))}
      </section>

      <section className="cards">
        {[
          {
            label: "CPC",
            value: costPerClick === null ? "—" : formatCurrency(costPerClick),
            meta: `${totals.clicks.toLocaleString()} ${t("Clicks")}`,
          },
          {
            label: "Cost per Lead",
            value: costPerLead === null ? "—" : formatCurrency(costPerLead),
            meta: `${totals.installs.toLocaleString()} ${t("Installs")}`,
          },
          {
            label: "Cost per Register",
            value: costPerRegister === null ? "—" : formatCurrency(costPerRegister),
            meta: `${totals.registers.toLocaleString()} ${t("Register")}`,
          },
          {
            label: "Cost per Purchase",
            value: costPerPurchase === null ? "—" : formatCurrency(costPerPurchase),
            meta: `${totals.ftds.toLocaleString()} ${t("FTD")}`,
          },
        ].map((stat, idx) => (
          <motion.div
            key={`cost-${stat.label}-${idx}`}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.4 }}
          >
            <div className="card-head">{t(stat.label)}</div>
            <div className="card-value">{stat.value}</div>
            <div className="card-meta">{stat.meta}</div>
          </motion.div>
        ))}
      </section>

      <section className="panels device-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Campaign Growth")}</h3>
              <p className="panel-subtitle">{t("Clicks and conversions over time.")}</p>
            </div>
            <div className="panel-actions">
              <select className="inline-select" value={buyerFilter} onChange={(e) => setBuyerFilter(e.target.value)}>
                {buyerOptionsLocal.map((option) => (
                  <option key={option} value={option}>
                    {option === "All buyers" ? t(option) : option}
                  </option>
                ))}
              </select>
              <select className="inline-select" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
                {domainOptionsLocal.map((option) => (
                  <option key={option} value={option}>
                    {option === "All domains" ? t(option) : option}
                  </option>
                ))}
              </select>
              <PeriodSelect
                value={period}
                onChange={setPeriod}
                customRange={customRange}
                onCustomChange={onCustomChange}
              />
            </div>
          </div>
          {campaignState.loading ? (
            <div className="empty-state">{t("Loading campaign stats…")}</div>
          ) : campaignState.error ? (
            <div className="empty-state error">{campaignState.error}</div>
          ) : growthSeries.length === 0 ? (
            <div className="empty-state">{t("No campaign data yet. Sync Keitaro with sub_id_3, sub_id_4, sub_id_5 and source.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={growthSeries} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="campaignGrowthClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={axisTickStyle} tickFormatter={formatShortDate} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={formatShortDate}
                    formatter={(value, name) => [Number(value || 0).toLocaleString(), name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Area type="monotone" dataKey="clicks" name={t("Clicks")} fill="url(#campaignGrowthClicks)" stroke="var(--blue)" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" name={t("Conversions")} stroke="var(--green)" strokeWidth={2.2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Campaign Comparisons")}</h3>
              <p className="panel-subtitle">{t("Top campaigns by clicks and conversions.")}</p>
            </div>
          </div>
          {campaignChartRows.length === 0 ? (
            <div className="empty-state">{t("No campaign comparison data.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={campaignChartRows} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="shortName" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [Number(value || 0).toLocaleString(), name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Bar dataKey="clicks" name={t("Clicks")} fill="var(--blue)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="conversions" name={t("Conversions")} fill="var(--purple)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel span-2 placement-conversion"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Creatives Success")}</h3>
              <p className="panel-subtitle">{t("Creative-level CPC, CPA, and conversion performance.")}</p>
            </div>
          </div>
          {creativeChartRows.length === 0 ? (
            <div className="empty-state">{t("No creative data available.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={330}>
                <ComposedChart data={creativeChartRows} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="shortName" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis yAxisId="volume" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis yAxisId="cost" orientation="right" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => {
                      if (name === "CPC" || name === "CPA") return [formatCurrency(value), name];
                      return [Number(value || 0).toLocaleString(), name];
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Bar yAxisId="volume" dataKey="conversions" name={t("Conversions")} fill="var(--green)" radius={[8, 8, 0, 0]} />
                  <Line yAxisId="cost" type="monotone" dataKey="cpc" name="CPC" stroke="var(--blue)" strokeWidth={2} dot={false} />
                  <Line yAxisId="cost" type="monotone" dataKey="cpa" name="CPA" stroke="var(--orange)" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Campaign and Creative Breakdown")}</h3>
              <p className="panel-subtitle">
                {t("Assigned to buyer and domain using clicks and conversion logs with CPC/CPA comparison.")}
              </p>
            </div>
          </div>
          {campaignState.loading ? (
            <div className="empty-state">{t("Loading campaign stats…")}</div>
          ) : campaignState.error ? (
            <div className="empty-state error">{campaignState.error}</div>
          ) : campaignTableRows.length === 0 ? (
            <div className="empty-state">{t("No campaign rows found.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    <th>{t("Media Buyer")}</th>
                    <th>{t("Domain")}</th>
                    <th>{t("Campaign")}</th>
                    <th>{t("Adset")}</th>
                    <th>{t("Ad")}</th>
                    <th>{t("Clicks")}</th>
                    <th>{t("Conversions")}</th>
                    <th>CPC</th>
                    <th>CPA</th>
                    <th>{t("Revenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignTableRows.map((row, idx) => (
                    <tr key={`${row.buyer}-${row.domain}-${row.campaignName}-${idx}`}>
                      <td>{row.buyer}</td>
                      <td>{row.domain}</td>
                      <td>{row.campaignName}</td>
                      <td>{row.adsetName}</td>
                      <td>{row.adName}</td>
                      <td>{row.clicks.toLocaleString()}</td>
                      <td>{row.conversions.toLocaleString()}</td>
                      <td>{formatCurrency(row.cpc)}</td>
                      <td>{formatCurrency(row.cpa)}</td>
                      <td>{formatCurrency(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

function UserBehaviorDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [behaviorEntries, setBehaviorEntries] = React.useState([]);
  const [behaviorState, setBehaviorState] = React.useState({ loading: true, error: null });
  const [search, setSearch] = React.useState("");
  const [behaviorFilter, setBehaviorFilter] = React.useState("Top User By Total Revenue");

  const fetchBehavior = React.useCallback(async () => {
    try {
      setBehaviorState({ loading: true, error: null });
      const response = await apiFetch("/api/user-behavior?limit=5000");
      if (!response.ok) {
        throw new Error("Failed to load user behavior.");
      }
      const data = await response.json();
      setBehaviorEntries(Array.isArray(data) ? data : []);
      setBehaviorState({ loading: false, error: null });
    } catch (error) {
      setBehaviorState({ loading: false, error: error.message || "Failed to load user behavior." });
    }
  }, []);

  React.useEffect(() => {
    fetchBehavior();
  }, [fetchBehavior]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchBehavior();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchBehavior]);

  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveDateRange =
    globalDateRange.from || globalDateRange.to ? globalDateRange : periodRange;
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";

  const normalizedSearch = search.trim().toLowerCase();
  const sum = (value) => Number(value || 0);

  const behaviorRows = React.useMemo(
    () =>
      behaviorEntries.filter((row) => {
        if (!isDateInRange(row.date || row.day || row.created_at, effectiveDateRange)) {
          return false;
        }
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
          return false;
        }
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        return true;
      }),
    [
      behaviorEntries,
      effectiveDateRange.from,
      effectiveDateRange.to,
      globalBuyerFilter,
      globalCountryFilter,
      effectiveBuyer,
      isLeadership,
    ]
  );

  const userData = React.useMemo(() => {
    const map = new Map();
    behaviorRows.forEach((row) => {
      const externalId = String(row.external_id || row.externalId || "").trim();
      if (!externalId) return;
      if (!map.has(externalId)) {
        map.set(externalId, {
          externalId,
          buyer: row.buyer || "",
          campaign: "",
          clicks: 0,
          registers: 0,
          ftds: 0,
          redeposits: 0,
          revenue: 0,
          ftdRevenue: 0,
          redepositRevenue: 0,
          campaigns: new Map(),
        });
      }
      const current = map.get(externalId);
      const ftdRevenueValue = Number.isFinite(Number(row.ftd_revenue ?? row.ftdRevenue))
        ? Number(row.ftd_revenue ?? row.ftdRevenue)
        : 0;
      const redepositRevenueValue = Number.isFinite(
        Number(row.redeposit_revenue ?? row.redepositRevenue)
      )
        ? Number(row.redeposit_revenue ?? row.redepositRevenue)
        : 0;
      const rowRevenueValue = Number.isFinite(Number(row.revenue)) ? Number(row.revenue) : 0;
      const revenueValue = rowRevenueValue > 0 ? rowRevenueValue : ftdRevenueValue + redepositRevenueValue;

      const campaign = String(row.campaign || "").trim();
      if (campaign) {
        const existing = current.campaigns.get(campaign) || 0;
        current.campaigns.set(campaign, existing + (revenueValue || 0));
      }

      current.clicks += sum(row.clicks);
      current.registers += sum(row.registers);
      current.ftds += sum(row.ftds);
      current.redeposits += sum(row.redeposits);
      current.revenue += revenueValue || 0;
      current.ftdRevenue += ftdRevenueValue || 0;
      current.redepositRevenue += redepositRevenueValue || 0;
    });

    return Array.from(map.values())
      .map((row) => {
        let topCampaign = "";
        let topValue = -1;
        row.campaigns.forEach((value, key) => {
          if (value > topValue) {
            topValue = value;
            topCampaign = key;
          }
        });
        return {
          ...row,
          campaign: topCampaign || row.campaign,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [behaviorRows]);

  const filteredUsers = React.useMemo(() => {
    if (!normalizedSearch) return userData;
    return userData.filter((row) => {
      const idMatch = row.externalId.toLowerCase().includes(normalizedSearch);
      const campaignMatch = String(row.campaign || "").toLowerCase().includes(normalizedSearch);
      return idMatch || campaignMatch;
    });
  }, [userData, normalizedSearch]);

  const behaviorFilterOptions = [
    "Tracked Users",
    "Top User By Total Revenue",
    "Top User by Revenue FTD",
    "Top User By Redeposit (number)",
  ];

  const sortedUsers = React.useMemo(() => {
    const rows = [...filteredUsers];
    const sortBy = behaviorFilter;
    const valueFor = (row) => {
      switch (sortBy) {
        case "Top User by Revenue FTD":
          return row.ftdRevenue || 0;
        case "Top User By Redeposit (number)":
          return row.redeposits || 0;
        case "Tracked Users":
        case "Top User By Total Revenue":
        default:
          return row.revenue || 0;
      }
    };
    return rows.sort((a, b) => valueFor(b) - valueFor(a));
  }, [filteredUsers, behaviorFilter]);

  const totalUsers = filteredUsers.length;
  const topByRevenue = [...filteredUsers].sort((a, b) => b.revenue - a.revenue)[0] || null;
  const topByFtdRevenue = [...filteredUsers].sort((a, b) => b.ftdRevenue - a.ftdRevenue)[0] || null;
  const topByRedeposit = [...filteredUsers].sort((a, b) => b.redeposits - a.redeposits)[0] || null;

  const topUsers = sortedUsers.slice(0, 10).map((row) => ({
    ...row,
    label: row.externalId.length > 12 ? `${row.externalId.slice(0, 12)}…` : row.externalId,
  }));

  return (
    <>
      <section className="cards">
        {[
          {
            label: "Tracked Users",
            value: totalUsers.toLocaleString(),
            meta: period === "All" ? "All time" : period,
          },
          {
            label: "Top User By Total Revenue",
            value: topByRevenue?.externalId || "—",
            meta: topByRevenue ? `${formatCurrency(topByRevenue.revenue)} · FTD + Redeposit` : "No data",
          },
          {
            label: "Top User by Revenue FTD",
            value: topByFtdRevenue?.externalId || "—",
            meta: topByFtdRevenue ? formatCurrency(topByFtdRevenue.ftdRevenue) : "No data",
          },
          {
            label: "Top User By Redeposit (number)",
            value: topByRedeposit?.externalId || "—",
            meta: topByRedeposit ? `${topByRedeposit.redeposits.toLocaleString()} Redeposits` : "No data",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
          >
            <div className="card-head">{t(stat.label)}</div>
            <div className="card-value">{stat.value}</div>
            <div className="card-meta">{t(stat.meta)}</div>
          </motion.div>
        ))}
      </section>

      <section className="panels device-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("User Revenue")}</h3>
              <p className="panel-subtitle">{t("Top players ranked by revenue.")}</p>
            </div>
            <div className="panel-actions">
              <input
                className="inline-input"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search external ID or campaign")}
              />
              <select
                className="inline-select"
                value={behaviorFilter}
                onChange={(event) => setBehaviorFilter(event.target.value)}
              >
                {behaviorFilterOptions.map((option) => (
                  <option key={option} value={option}>
                    {t(option)}
                  </option>
                ))}
              </select>
              <PeriodSelect
                value={period}
                onChange={setPeriod}
                customRange={customRange}
                onCustomChange={onCustomChange}
              />
            </div>
          </div>
          {behaviorState.loading ? (
            <div className="empty-state">{t("Loading user behavior…")}</div>
          ) : behaviorState.error ? (
            <div className="empty-state error">{behaviorState.error}</div>
          ) : topUsers.length === 0 ? (
            <div className="empty-state">{t("No user behavior data available.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topUsers} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="userRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatCurrency(value), t("Revenue")]}
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload?.externalId || label
                    }
                  />
                  <Bar dataKey="revenue" fill="url(#userRevenue)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Conversions by User")}</h3>
              <p className="panel-subtitle">{t("FTDs and redeposits by external ID.")}</p>
            </div>
          </div>
          {topUsers.length === 0 ? (
            <div className="empty-state">{t("No conversion data available.")}</div>
          ) : (
            <div className="chart chart-surface">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topUsers} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [Number(value || 0).toLocaleString(), name]}
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload?.externalId || label
                    }
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, color: "#9aa0aa", fontSize: 12 }} />
                  <Bar dataKey="ftds" name={t("FTDs")} fill="var(--green)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="redeposits" name={t("Redeposits")} fill="var(--orange)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("User Behavior")}</h3>
              <p className="panel-subtitle">{t("External ID performance and campaign attribution.")}</p>
            </div>
          </div>

          {behaviorState.loading ? (
            <div className="empty-state">{t("Loading user behavior…")}</div>
          ) : behaviorState.error ? (
            <div className="empty-state error">{behaviorState.error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">{t("No user behavior data available.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    <th>{t("External ID")}</th>
                    <th>{t("Campaign")}</th>
                    <th>{t("Clicks")}</th>
                    <th>{t("Registers")}</th>
                    <th>{t("FTDs")}</th>
                    <th>{t("Redeposits")}</th>
                    <th>{t("Revenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((row) => (
                    <tr key={row.externalId}>
                      <td>{row.externalId}</td>
                      <td>{row.campaign || "—"}</td>
                      <td>{row.clicks.toLocaleString()}</td>
                      <td>{row.registers.toLocaleString()}</td>
                      <td>{row.ftds.toLocaleString()}</td>
                      <td>{row.redeposits.toLocaleString()}</td>
                      <td>{formatCurrency(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

function DevicesDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [deviceEntries, setDeviceEntries] = React.useState([]);
  const [deviceState, setDeviceState] = React.useState({ loading: true, error: null });
  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveDateRange =
    globalDateRange.from || globalDateRange.to ? globalDateRange : periodRange;
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";

  const fetchDeviceStats = React.useCallback(async () => {
    try {
      setDeviceState({ loading: true, error: null });
      const response = await apiFetch("/api/device-stats?limit=500");
      if (!response.ok) {
        throw new Error("Failed to load device stats.");
      }
      const data = await response.json();
      setDeviceEntries(data);
      setDeviceState({ loading: false, error: null });
    } catch (error) {
      setDeviceState({ loading: false, error: error.message || "Failed to load device stats." });
    }
  }, []);

  React.useEffect(() => {
    fetchDeviceStats();
  }, [fetchDeviceStats]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchDeviceStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchDeviceStats]);

  const filteredDeviceEntries = React.useMemo(
    () =>
      deviceEntries.filter((row) => {
        if (!isDateInRange(row.date, effectiveDateRange)) return false;
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
          return false;
        }
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        return true;
      }),
    [
      deviceEntries,
      effectiveDateRange.from,
      effectiveDateRange.to,
      globalBuyerFilter,
      globalCountryFilter,
      effectiveBuyer,
      isLeadership,
    ]
  );

  const sum = (value) => Number(value || 0);
  const deviceMap = new Map();

  const getDeviceKey = (row) => {
    const device = row.device || "Unknown";
    const os = row.os || row.os_version || row.osVersion || "";
    const osVersion = row.os_version || row.osVersion || "";
    const deviceModel = row.device_model || row.deviceModel || "";
    return `${device}||${os}||${osVersion}||${deviceModel}`;
  };

  filteredDeviceEntries.forEach((row) => {
    const device = row.device || "Unknown";
    const os = row.os || row.os_version || row.osVersion || "";
    const osVersion = row.os_version || row.osVersion || "";
    const osIcon = row.os_icon || row.osIcon || "";
    const deviceModel = row.device_model || row.deviceModel || "";
    const key = getDeviceKey(row);
    if (!deviceMap.has(key)) {
      deviceMap.set(key, {
        key,
        device,
        os,
        osVersion,
        osIcon,
        deviceModel,
        label: [device, os, osVersion, deviceModel].filter(Boolean).join(" · "),
        clicks: 0,
        installs: 0,
        registers: 0,
        ftds: 0,
        spend: 0,
        revenue: 0,
      });
    }
    const current = deviceMap.get(key);
    current.clicks += sum(row.clicks);
    current.installs += sum(row.installs);
    current.registers += sum(row.registers);
    current.ftds += sum(row.ftds);
    current.spend += sum(row.spend);
    current.revenue += sum(row.revenue);
  });

  const deviceData = Array.from(deviceMap.values()).sort((a, b) => b.revenue - a.revenue);

  const osMap = new Map();
  deviceData.forEach((row) => {
    const osName = row.os || row.device || "Unknown";
    const key = osName.toLowerCase();
    if (!osMap.has(key)) {
      osMap.set(key, { key, name: osName, revenue: 0, clicks: 0, installs: 0, ftds: 0 });
    }
    const current = osMap.get(key);
    current.revenue += row.revenue || 0;
    current.clicks += row.clicks || 0;
    current.installs += row.installs || 0;
    current.ftds += row.ftds || 0;
  });
  const osData = Array.from(osMap.values()).sort((a, b) => b.revenue - a.revenue);
  const topOs = osData[0] || null;

  const osVersionMap = new Map();
  deviceData.forEach((row) => {
    const osName = row.os || row.device || "Unknown";
    const version = row.osVersion || "Unknown";
    const key = `${osName}||${version}`;
    const label = version && version !== "Unknown" ? `${osName} ${version}`.trim() : osName;
    if (!osVersionMap.has(key)) {
      osVersionMap.set(key, { key, label, os: osName, version, revenue: 0, clicks: 0, installs: 0, ftds: 0 });
    }
    const current = osVersionMap.get(key);
    current.revenue += row.revenue || 0;
    current.clicks += row.clicks || 0;
    current.installs += row.installs || 0;
    current.ftds += row.ftds || 0;
  });
  const osVersionData = Array.from(osVersionMap.values()).sort((a, b) => b.revenue - a.revenue);
  const topOsVersion = osVersionData[0] || null;
  const topOsVersionCr =
    topOsVersion && topOsVersion.clicks
      ? (topOsVersion.ftds / topOsVersion.clicks) * 100
      : 0;

  const deviceChartData = deviceData.map((row) => ({
    key: row.key,
    device: row.label || row.device,
    deviceRaw: row.device,
    deviceModel: row.deviceModel,
    osIcon: row.osIcon,
    os: row.os,
    osVersion: row.osVersion,
    revenue: row.revenue,
    clicks: row.clicks,
    installs: row.installs,
    cr: row.clicks ? (row.ftds / row.clicks) * 100 : 0,
  }));

  const osChartData = osData.map((row) => ({
    key: row.key,
    os: row.name,
    revenue: row.revenue,
    clicks: row.clicks,
    installs: row.installs,
    cr: row.clicks ? (row.ftds / row.clicks) * 100 : 0,
  }));

  const valueDomain = (data, key) => [
    0,
    (dataMax) => {
      const maxValue = Math.max(dataMax || 0, ...data.map((item) => item[key] || 0));
      return maxValue > 0 ? Math.ceil(maxValue * 1.15) : 10;
    },
  ];

  const TopOsIcon = getOsIconComponent(topOs?.name);
  const topOsAccent = getOsAccent(topOs?.name);

  return (
    <>
      <section className="cards">
        {[
          {
            label: "Top OS",
            value: topOs?.name || "—",
            iconNode: <TopOsIcon size={18} style={{ color: topOsAccent }} />,
            meta: topOs ? `${t("Revenue")}: ${formatCurrency(topOs.revenue)}` : t("No data"),
          },
          {
            label: "Top OS Version",
            value: topOsVersion?.label || "—",
            icon: Wallet,
            meta: topOsVersion ? `${t("Revenue")}: ${formatCurrency(topOsVersion.revenue)}` : t("No data"),
          },
          {
            label: "Top OS Installs",
            value: topOsVersion ? Number(topOsVersion.installs || 0).toLocaleString() : "0",
            icon: Download,
            meta: topOsVersion ? topOsVersion.label : t("No data"),
          },
          {
            label: "Top OS CR",
            value: `${topOsVersionCr.toFixed(2)}%`,
            icon: Target,
            meta: topOsVersion ? `${t("FTD / Clicks")} · ${topOsVersion.label}` : t("No data"),
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
            >
              <div className="card-head">
                {stat.iconNode || (Icon ? <Icon size={18} /> : null)}
                {t(stat.label)}
              </div>
              <div className="card-value">{stat.value}</div>
              <div className="card-meta">{t(stat.meta)}</div>
            </motion.div>
          );
        })}
      </section>

      <section className="panels device-charts">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Revenue by OS")}</h3>
              <p className="panel-subtitle">{t("Track revenue contribution by OS.")}</p>
            </div>
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomChange={onCustomChange}
            />
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={osChartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="deviceRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="os" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  tick={axisTickStyle}
                  domain={valueDomain(osChartData, "revenue")}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatCurrency(value), t("Revenue")]}
                />
                <Bar dataKey="revenue" fill="url(#deviceRevenue)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Click by OS")}</h3>
              <p className="panel-subtitle">{t("Clicks volume grouped by OS.")}</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={osChartData}
                margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
                layout="vertical"
                barCategoryGap={12}
              >
                <defs>
                  <linearGradient id="deviceClicks" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  tickFormatter={(value) => Number(value || 0).toLocaleString()}
                  domain={valueDomain(osChartData, "clicks")}
                />
                <YAxis
                  type="category"
                  dataKey="os"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  width={90}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [value?.toLocaleString?.() ?? value, t("Clicks")]}
                />
                <Bar dataKey="clicks" fill="url(#deviceClicks)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Install By OS")}</h3>
              <p className="panel-subtitle">{t("Install postbacks grouped by OS.")}</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={osChartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="deviceInstalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="os" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [value?.toLocaleString?.() ?? value, t("Install")]}
                />
                <Bar dataKey="installs" fill="url(#deviceInstalls)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("CR by OS")}</h3>
              <p className="panel-subtitle">{t("FTD conversion rate by OS.")}</p>
            </div>
          </div>
          <div className="chart chart-surface">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={osChartData} margin={{ top: 12, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="deviceCr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--orange)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="os" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} domain={[0, 100]} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${Number(value || 0).toFixed(2)}%`, t("Conversion Rate")]}
                />
                <Bar dataKey="cr" fill="url(#deviceCr)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Device Breakdown")}</h3>
              <p className="panel-subtitle">{t("Clicks, installs, revenue, and CR by device.")}</p>
            </div>
          </div>

          {deviceState.loading ? (
            <div className="empty-state">{t("Loading device stats…")}</div>
          ) : deviceState.error ? (
            <div className="empty-state error">{deviceState.error}</div>
          ) : deviceChartData.length === 0 ? (
            <div className="empty-state">{t("No device data available yet.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    <th>{t("Device")}</th>
                    <th>{t("OS")}</th>
                    <th>{t("OS Version")}</th>
                    <th>{t("Device Model")}</th>
                    <th>{t("Clicks")}</th>
                    <th>{t("Installs")}</th>
                    <th>{t("Registers")}</th>
                    <th>{t("FTDs")}</th>
                    <th>{t("Revenue")}</th>
                    <th>{t("Conversion Rate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {deviceChartData.map((row) => {
                    const stats = deviceMap.get(row.key);
                    return (
                      <tr key={row.key}>
                        <td>{row.device}</td>
                        <td>{row.os || "—"}</td>
                        <td>{row.osVersion || "—"}</td>
                        <td>{row.deviceModel || "—"}</td>
                        <td>{row.clicks.toLocaleString()}</td>
                        <td>{row.installs.toLocaleString()}</td>
                        <td>{stats?.registers.toLocaleString() || "0"}</td>
                        <td>{stats?.ftds.toLocaleString() || "0"}</td>
                        <td>{formatCurrency(row.revenue)}</td>
                        <td>{`${row.cr.toFixed(2)}%`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

function GoalsDashboard({ authUser }) {
  const { t } = useLanguage();
  const [goalForm, setGoalForm] = React.useState({
    buyer: "DeusInsta",
    country: "Brazil",
    period: "Monthly",
    dateFrom: "2026-02-01",
    dateTo: "2026-02-28",
    ftdsTarget: "",
    r2dTarget: "",
    isGlobal: false,
    notes: "",
  });
  const [goals, setGoals] = React.useState([]);
  const [goalState, setGoalState] = React.useState({ loading: true, error: null });
  const [statsEntries, setStatsEntries] = React.useState([]);
  const [teamForm, setTeamForm] = React.useState({
    name: "",
    role: "Media Buyer",
    country: "Brazil",
    approach: "Paid Social",
    game: "",
    email: "",
    contact: "",
    status: "Active",
  });
  const [teamMembers, setTeamMembers] = React.useState([]);
  const [teamState, setTeamState] = React.useState({ loading: true, error: null });

  const updateGoalForm = (key) => (event) => {
    setGoalForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const updateTeamForm = (key) => (event) => {
    setTeamForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetGoalForm = () => {
    setGoalForm({
      buyer: "DeusInsta",
      country: "Brazil",
      period: "Monthly",
      dateFrom: "2026-02-01",
      dateTo: "2026-02-28",
      ftdsTarget: "",
      r2dTarget: "",
      isGlobal: false,
      notes: "",
    });
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: "",
      role: "Media Buyer",
      country: "Brazil",
      approach: "Paid Social",
      game: "",
      email: "",
      contact: "",
      status: "Active",
    });
  };

  const fetchGoals = React.useCallback(async () => {
    try {
      setGoalState({ loading: true, error: null });
      const response = await apiFetch("/api/goals?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load goals.");
      }
      const data = await response.json();
      setGoals(data);
      setGoalState({ loading: false, error: null });
    } catch (error) {
      setGoalState({ loading: false, error: error.message || "Failed to load goals." });
    }
  }, []);

  const fetchGoalStats = React.useCallback(async () => {
    try {
      const response = await apiFetch("/api/media-stats?limit=500");
      if (!response.ok) return;
      const data = await response.json();
      setStatsEntries(data);
    } catch (error) {
      setStatsEntries([]);
    }
  }, []);

  const fetchTeamMembers = React.useCallback(async () => {
    try {
      setTeamState({ loading: true, error: null });
      const response = await apiFetch("/api/media-buyers?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load media buyers.");
      }
      const data = await response.json();
      setTeamMembers(data);
      setTeamState({ loading: false, error: null });
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to load media buyers." });
    }
  }, []);

  React.useEffect(() => {
    fetchGoals();
    fetchGoalStats();
    fetchTeamMembers();
  }, [fetchGoals, fetchGoalStats, fetchTeamMembers]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchGoalStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchGoalStats]);

  const handleGoalSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save goal.");
      }
      await fetchGoals();
      resetGoalForm();
    } catch (error) {
      setGoalState({ loading: false, error: error.message || "Failed to save goal." });
    }
  };

  const handleTeamSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/media-buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save media buyer.");
      }
      await fetchTeamMembers();
      resetTeamForm();
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to save media buyer." });
    }
  };

  const handleGoalDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete goal.");
      }
      await fetchGoals();
    } catch (error) {
      setGoalState({ loading: false, error: error.message || "Failed to delete goal." });
    }
  };

  const handleTeamDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/media-buyers/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete media buyer.");
      }
      await fetchTeamMembers();
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to delete media buyer." });
    }
  };

  const sum = (value) => Number(value || 0);
  const inRange = (date, from, to) => {
    if (!date || !from || !to) return false;
    return date >= from && date <= to;
  };

  const totalsForGoal = (goal, viewerBuyer) =>
    statsEntries
      .filter((row) => {
        if (!inRange(row.date, goal.date_from, goal.date_to)) return false;
        if (goal.country && row.country !== goal.country) return false;
        if (goal.is_global) {
          if (viewerBuyer) return row.buyer === viewerBuyer;
          return true;
        }
        return row.buyer === goal.buyer;
      })
      .reduce(
        (acc, row) => ({
          clicks: acc.clicks + sum(row.clicks),
          registers: acc.registers + sum(row.registers),
          ftds: acc.ftds + sum(row.ftds),
          spend: acc.spend + sum(row.spend),
        }),
        { clicks: 0, registers: 0, ftds: 0, spend: 0 }
      );

  const formatProgress = (actual, target) => {
    if (actual === null || actual === undefined || !target || Number(target) <= 0)
      return { label: "—", pct: null };
    const pct = Math.min(100, (actual / Number(target)) * 100);
    return { label: `${pct.toFixed(1)}%`, pct };
  };

  const buyerDirectoryOptions = Array.from(
    new Set([...buyerOptions, ...teamMembers.map((member) => member.name).filter(Boolean)])
  );
  const mediaBuyerApproaches = approachOptions.filter((item) => item !== "All");
  const currentRole = authUser?.role || "Media Buyer";
  const isLeadership = currentRole === "Boss" || currentRole === "Team Leader";
  const buyerId = authUser?.buyerId;
  const buyerNameFromId = teamMembers.find((member) => member.id === buyerId)?.name;
  const viewerBuyer = buyerNameFromId || authUser?.username || "";
  const displayGoals = goals
    .filter((goal) => {
      if (isLeadership) return true;
      if (goal.is_global) return true;
      if (!viewerBuyer) return false;
      return goal.buyer === viewerBuyer;
    })
    .sort((a, b) => (b.is_global ? 1 : 0) - (a.is_global ? 1 : 0));

  const getGoalProgress = (goal) => {
    const totals = totalsForGoal(goal, goal.is_global && !isLeadership ? viewerBuyer : null);
    const ftdProgress = formatProgress(totals.ftds, goal.ftds_target);
    const r2dActual = totals.registers > 0 ? (totals.ftds / totals.registers) * 100 : null;
    const r2dProgress = formatProgress(r2dActual, goal.r2d_target);
    const progressValues = [ftdProgress.pct, r2dProgress.pct].filter((value) => value !== null);
    const overall =
      progressValues.length > 0
        ? progressValues.reduce((sumVal, value) => sumVal + value, 0) / progressValues.length
        : null;
    const statusLabel =
      overall === null
        ? t("No targets")
        : overall >= 100
        ? t("Achieved")
        : overall >= 80
        ? t("On track")
        : t("Behind");
    return { totals, ftdProgress, r2dActual, r2dProgress, overall, statusLabel };
  };

  const goalSummary = React.useMemo(() => {
    return displayGoals.reduce(
      (acc, goal) => {
        const { overall } = getGoalProgress(goal);
        if (overall !== null && overall >= 100) {
          acc.achieved += 1;
        } else {
          acc.unachieved += 1;
        }
        return acc;
      },
      { achieved: 0, unachieved: 0 }
    );
  }, [displayGoals, statsEntries, isLeadership, viewerBuyer]);

  return (
    <>
      <section className="panels goals-panels">
        {isLeadership ? (
          <motion.div
            className="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="panel-head">
              <div>
                <h3 className="panel-title">{t("Goal Setup")}</h3>
                <p className="panel-subtitle">
                  {t("Define the target outcomes your media buyers must reach.")}
                </p>
              </div>
            </div>

            <form className="form-grid goals-form" onSubmit={handleGoalSubmit}>
              <div className="field">
                <label>{t("Goal Scope")}</label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={goalForm.isGlobal}
                    onChange={(event) =>
                      setGoalForm((prev) => ({ ...prev, isGlobal: event.target.checked }))
                    }
                  />
                  {t("Global Goal")}
                </label>
              </div>
              <div className="field">
                <label>{t("Media Buyer")}</label>
                <input
                  list="buyer-options"
                  value={goalForm.isGlobal ? t("All Buyers") : goalForm.buyer}
                  onChange={updateGoalForm("buyer")}
                  disabled={goalForm.isGlobal}
                />
                <datalist id="buyer-options">
                  {buyerDirectoryOptions.map((buyer) => (
                    <option key={buyer} value={buyer} />
                  ))}
                </datalist>
              </div>
              <div className="field">
                <label>{t("Country")}</label>
                <select value={goalForm.country} onChange={updateGoalForm("country")}>
                  {countryOptions.map((country) => (
                    <option key={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t("Period")}</label>
                <select value={goalForm.period} onChange={updateGoalForm("period")}>
                  {["Daily", "Weekly", "Monthly", "Custom"].map((item) => (
                    <option key={item} value={item}>
                      {t(item)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field goal-range">
                <label>{t("Date Range")}</label>
                <div className="field-row">
                  <input type="date" value={goalForm.dateFrom} onChange={updateGoalForm("dateFrom")} />
                  <span className="field-sep">{t("to")}</span>
                  <input type="date" value={goalForm.dateTo} onChange={updateGoalForm("dateTo")} />
                </div>
              </div>
              <div className="field">
                <label>{t("FTDs Target")}</label>
                <input
                  type="number"
                  min="0"
                  value={goalForm.ftdsTarget}
                  onChange={updateGoalForm("ftdsTarget")}
                />
              </div>
              <div className="field">
                <label>{t("Reg2Dep Target (%)")}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={goalForm.r2dTarget}
                  onChange={updateGoalForm("r2dTarget")}
                />
              </div>
              <div className="field">
                <label>{t("Notes")}</label>
                <input value={goalForm.notes} onChange={updateGoalForm("notes")} />
              </div>
              <div className="form-actions">
                <button className="ghost" type="button" onClick={resetGoalForm}>
                  {t("Reset")}
                </button>
                <button className="action-pill" type="submit">
                  {t("Add Goal")}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            className="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="panel-head">
              <div>
                <h3 className="panel-title">{t("Goals Assigned")}</h3>
                <p className="panel-subtitle">
                  {t("Your goals are managed by leadership. Track progress below.")}
                </p>
              </div>
            </div>
            <div className="empty-state">{t("No goal setup access for your role.")}</div>
          </motion.div>
        )}

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Goals Overview")}</h3>
              <p className="panel-subtitle">
                {t("Track progress vs. targets using live statistics data.")}
              </p>
            </div>
          </div>

          {goalState.loading ? (
            <div className="empty-state">{t("Loading goals…")}</div>
          ) : goalState.error ? (
            <div className="empty-state error">{goalState.error}</div>
          ) : displayGoals.length === 0 ? (
            <div className="empty-state">{t("No goals set yet.")}</div>
          ) : (
            <>
              <div className="goal-summary">
                <div className="goal-summary-card">
                  <span>{t("Achieved Targets")}</span>
                  <strong>{goalSummary.achieved}</strong>
                </div>
                <div className="goal-summary-card is-warning">
                  <span>{t("Unachieved Targets")}</span>
                  <strong>{goalSummary.unachieved}</strong>
                </div>
              </div>
              <div className="goal-list">
                {displayGoals.map((goal) => {
                  const { totals, ftdProgress, r2dActual, r2dProgress, overall, statusLabel } =
                    getGoalProgress(goal);
                return (
                  <div key={goal.id} className={`goal-card${goal.is_global ? " is-global" : ""}`}>
                    <div className="goal-banner">
                      <div className="goal-banner-main">
                        <div>
                          <div className="goal-title">
                            {goal.is_global ? t("Global Goal") : goal.buyer}
                          </div>
                          <div className="goal-sub">
                            {t(goal.period)} · {goal.country || t("All Countries")} · {goal.date_from} → {goal.date_to}
                            {goal.is_global && !isLeadership ? ` · ${t("Based on your metrics")}` : ""}
                          </div>
                        </div>
                        <div className="goal-actions">
                          <span className={`goal-status ${statusLabel.replace(" ", "-").toLowerCase()}`}>
                            {statusLabel}
                          </span>
                          {isLeadership ? (
                            <button className="icon-btn" type="button" onClick={() => handleGoalDelete(goal.id)}>
                              <Trash2 size={16} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className="goal-banner-metrics">
                        <div className="goal-banner-item">
                          <span>{t("FTDs Target")}</span>
                          <strong>
                            {goal.ftds_target && Number(goal.ftds_target) > 0
                              ? Number(goal.ftds_target).toLocaleString()
                              : "—"}
                          </strong>
                        </div>
                        <div className="goal-banner-item">
                          <span>{t("Reg2Dep Target (%)")}</span>
                          <strong>
                            {goal.r2d_target && Number(goal.r2d_target) > 0
                              ? `${Number(goal.r2d_target).toFixed(2)}%`
                              : "—"}
                          </strong>
                        </div>
                        <div className="goal-banner-item">
                          <span>{goal.is_global && !isLeadership ? t("Your Progress") : t("Progress")}</span>
                          <strong>{overall === null ? "—" : `${overall.toFixed(1)}%`}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="goal-metrics">
                      {[
                        {
                          label: "FTDs",
                          actual: totals.ftds,
                          target: goal.ftds_target,
                          progress: ftdProgress,
                          color: "var(--green)",
                        },
                        {
                          label: "Reg2Dep",
                          actual: r2dActual,
                          target: goal.r2d_target,
                          progress: r2dProgress,
                          color: "var(--blue)",
                          isPercent: true,
                        },
                      ].map((metric) => {
                        const actualLabel = metric.isPercent
                          ? metric.actual === null
                            ? "—"
                            : `${metric.actual.toFixed(2)}%`
                          : metric.actual.toLocaleString();
                        const targetLabel =
                          metric.target && Number(metric.target) > 0
                            ? metric.isPercent
                              ? `${Number(metric.target).toFixed(2)}%`
                              : Number(metric.target).toLocaleString()
                            : "—";
                        return (
                          <div key={metric.label} className="goal-metric" style={{ "--goal-color": metric.color }}>
                            <div className="goal-metric-head">
                              <span>{t(metric.label)}</span>
                              <span className="goal-metric-pct">{metric.progress.label}</span>
                            </div>
                            <div className="goal-metric-value">
                              {actualLabel}
                              <span> / {targetLabel}</span>
                            </div>
                            <div className="goal-bar">
                              <span
                                className="goal-bar-fill"
                                style={{ width: metric.progress.pct ? `${metric.progress.pct}%` : "0%" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {goal.notes ? <div className="goal-notes">{goal.notes}</div> : null}
                  </div>
                );
              })}
              </div>
            </>
          )}
        </motion.div>
      </section>


    </>
  );
}

function DomainsDashboard({ authUser }) {
  const { t } = useLanguage();
  const ownerRole = authUser?.role || roleOptions[0];
  const canManageDomains = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const [domainForm, setDomainForm] = React.useState(() => ({
    domain: "",
    status: "Active",
    game: "",
    platform: "PWA Group",
    country: "Brazil",
    ownerRole,
  }));
  const [domains, setDomains] = React.useState([]);
  const [domainState, setDomainState] = React.useState({ loading: true, error: null });
  const [users, setUsers] = React.useState([]);
  const [userState, setUserState] = React.useState({ loading: true, error: null });

  const updateDomainForm = (key) => (event) => {
    setDomainForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetDomainForm = () => {
    setDomainForm({
      domain: "",
      status: "Active",
      game: "",
      platform: "PWA Group",
      country: "Brazil",
      ownerRole,
    });
  };

  React.useEffect(() => {
    setDomainForm((prev) => ({ ...prev, ownerRole }));
  }, [ownerRole]);

  const fetchDomains = React.useCallback(async () => {
    try {
      setDomainState({ loading: true, error: null });
      const response = await apiFetch("/api/domains?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load domains.");
      }
      const data = await response.json();
      setDomains(data);
      setDomainState({ loading: false, error: null });
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to load domains." });
    }
  }, []);

  const fetchUsers = React.useCallback(async () => {
    try {
      setUserState({ loading: true, error: null });
      const response = await apiFetch("/api/users?limit=500");
      if (!response.ok) {
        throw new Error("Failed to load users.");
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      setUserState({ loading: false, error: null });
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to load users." });
    }
  }, []);

  React.useEffect(() => {
    fetchDomains();
    fetchUsers();
  }, [fetchDomains, fetchUsers]);

  const userMap = React.useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      if (user?.id) {
        map.set(user.id, user.username);
      }
    });
    return map;
  }, [users]);

  const roleMap = React.useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      if (!user?.role || !user?.username) return;
      const list = map.get(user.role) || [];
      list.push(user.username);
      map.set(user.role, list);
    });
    return map;
  }, [users]);

  const resolveOwnerName = React.useCallback(
    (domain) => {
      if (!domain) return "—";
      if (domain.owner_name) return domain.owner_name;
      if (domain.owner_id && userMap.has(domain.owner_id)) {
        return userMap.get(domain.owner_id);
      }
      if (domain.owner_role) {
        const candidates = roleMap.get(domain.owner_role) || [];
        if (candidates.length === 1) {
          return candidates[0];
        }
        return t(domain.owner_role);
      }
      return "—";
    },
    [roleMap, t, userMap]
  );

  const handleDomainSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(domainForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save domain.");
      }
      await fetchDomains();
      resetDomainForm();
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to save domain." });
    }
  };

  const handleDomainDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/domains/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete domain.");
      }
      await fetchDomains();
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to delete domain." });
    }
  };

  const handleDomainStatusChange = async (id, status) => {
    try {
      const response = await apiFetch(`/api/domains/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update domain status.");
      }
      await fetchDomains();
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to update domain status." });
    }
  };

  const visibleDomains = React.useMemo(() => {
    if (canManageDomains) return domains;
    return domains.filter((domain) => domain.owner_id === authUser?.id);
  }, [canManageDomains, domains, authUser?.id]);

  return (
    <section className="form-section">
      <motion.div
        className="panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="panel-head">
          <div>
            <h3 className="panel-title">{t("Domains Registry")}</h3>
            <p className="panel-subtitle">{t("Track every domain in use and keep its status updated.")}</p>
          </div>
        </div>

        <form className="form-grid domain-form" onSubmit={handleDomainSubmit}>
          <div className="field">
            <label>{t("Domain")}</label>
            <input
              value={domainForm.domain}
              onChange={updateDomainForm("domain")}
              placeholder="landing.yourdomain.com"
              required
            />
          </div>
          <div className="field">
            <label>{t("Status")}</label>
            <select value={domainForm.status} onChange={updateDomainForm("status")}>
              {["Active", "Pending", "Paused", "Expired", "Blocked"].map((status) => (
                <option key={status} value={status}>
                  {t(status)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>{t("Game")}</label>
            <input
              value={domainForm.game}
              onChange={updateDomainForm("game")}
              placeholder={t("e.g. Crash, Roulette")}
              required
            />
          </div>
          <div className="field">
            <label>{t("Platform")}</label>
            <select value={domainForm.platform} onChange={updateDomainForm("platform")} required>
              {["PWA Group", "Link Group", "ZM apps"].map((platform) => (
                <option key={platform} value={platform}>
                  {t(platform)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>{t("Target Country")}</label>
            <select value={domainForm.country} onChange={updateDomainForm("country")} required>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>{t("Owner")}</label>
            <input
              value={
                authUser?.username
                  ? `${authUser.username} · ${t(domainForm.ownerRole || ownerRole)}`
                  : t(domainForm.ownerRole || ownerRole)
              }
              disabled
            />
          </div>
          <div className="form-actions">
            <button className="ghost" type="button" onClick={resetDomainForm}>
              {t("Reset")}
            </button>
            <button className="action-pill" type="submit">
              {t("Add Domain")}
            </button>
          </div>
        </form>

        {domainState.loading ? (
          <div className="empty-state">{t("Loading domains…")}</div>
        ) : domainState.error ? (
          <div className="empty-state error">{domainState.error}</div>
        ) : visibleDomains.length === 0 ? (
          <div className="empty-state">{t("No domains added yet.")}</div>
        ) : (
          <div className="table-wrap">
            <table className="entries-table domain-table">
              <thead>
                <tr>
                  <th>{t("Domain")}</th>
                  <th>{t("Game")}</th>
                  <th>{t("Platform")}</th>
                  <th>{t("Country")}</th>
                  <th>{t("Owner")}</th>
                  <th>{t("Status")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibleDomains.map((domain) => (
                  <tr key={domain.id}>
                    <td>{domain.domain}</td>
                    <td>{domain.game || "—"}</td>
                    <td>{domain.platform || "—"}</td>
                    <td>{domain.country || "—"}</td>
                    <td>{resolveOwnerName(domain)}</td>
                    <td>
                      {canManageDomains || domain.owner_id === authUser?.id ? (
                        <select
                          className={`inline-select status-select status-${(domain.status || "inactive").toLowerCase()}`}
                          value={domain.status}
                          onChange={(event) =>
                            handleDomainStatusChange(domain.id, event.target.value)
                          }
                        >
                          {["Active", "Pending", "Paused", "Expired", "Blocked"].map((status) => (
                            <option key={status} value={status}>
                              {t(status)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`status-pill status-${domain.status?.toLowerCase() || "inactive"}`}>
                          {t(domain.status)}
                        </span>
                      )}
                    </td>
                    <td>
                      <button className="icon-btn" type="button" onClick={() => handleDomainDelete(domain.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </section>
  );
}

function PixelsDashboard({ authUser }) {
  const { t } = useLanguage();
  const canManagePixels = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const [pixels, setPixels] = React.useState([]);
  const [pixelState, setPixelState] = React.useState({ loading: true, error: null });
  const [domains, setDomains] = React.useState([]);
  const [domainState, setDomainState] = React.useState({ loading: true, error: null });
  const [users, setUsers] = React.useState([]);
  const [userState, setUserState] = React.useState({ loading: true, error: null });
  const [showForm, setShowForm] = React.useState(true);
  const [pixelForm, setPixelForm] = React.useState({
    pixelId: "",
    tokenEaag: "",
    flow: "",
    geo: "Brazil",
    status: "Active",
    comment: "",
  });
  const [copyToast, setCopyToast] = React.useState({
    visible: false,
    type: "success",
    message: "",
    left: 0,
    top: 0,
    above: true,
  });
  const [commentModal, setCommentModal] = React.useState({
    open: false,
    pixel: null,
    value: "",
  });
  const copyToastTimeoutRef = React.useRef(null);
  const normalizeRole = React.useCallback((value) => String(value || "").trim().toLowerCase(), []);

  const updatePixelForm = (key) => (event) => {
    setPixelForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetPixelForm = () => {
    setPixelForm({
      pixelId: "",
      tokenEaag: "",
      flow: "",
      geo: "Brazil",
      status: "Active",
      comment: "",
    });
  };

  const fetchPixels = React.useCallback(async () => {
    try {
      setPixelState({ loading: true, error: null });
      const response = await apiFetch("/api/pixels?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load pixels.");
      }
      const data = await response.json();
      setPixels(data);
      setPixelState({ loading: false, error: null });
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to load pixels." });
    }
  }, []);

  const fetchDomains = React.useCallback(async () => {
    try {
      setDomainState({ loading: true, error: null });
      const response = await apiFetch("/api/domains?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load domains.");
      }
      const data = await response.json();
      setDomains(data);
      setDomainState({ loading: false, error: null });
    } catch (error) {
      setDomainState({ loading: false, error: error.message || "Failed to load domains." });
    }
  }, []);

  const fetchUsers = React.useCallback(async () => {
    if (!canManagePixels) return;
    try {
      setUserState({ loading: true, error: null });
      const response = await apiFetch("/api/users?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load users.");
      }
      const data = await response.json();
      setUsers(data);
      setUserState({ loading: false, error: null });
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to load users." });
    }
  }, [canManagePixels]);

  React.useEffect(() => {
    fetchPixels();
    fetchDomains();
    fetchUsers();
  }, [fetchPixels, fetchDomains, fetchUsers]);

  React.useEffect(() => {
    return () => {
      if (copyToastTimeoutRef.current) {
        clearTimeout(copyToastTimeoutRef.current);
      }
    };
  }, []);

  const showCopyToast = React.useCallback((type, message, anchorRect) => {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
    const fallbackLeft = viewportWidth / 2;
    const rawLeft = anchorRect ? anchorRect.left + anchorRect.width / 2 : fallbackLeft;
    const clampedLeft = Math.max(170, Math.min(viewportWidth - 170, rawLeft));
    const showAbove = anchorRect ? anchorRect.top > 72 : true;
    const top = anchorRect
      ? showAbove
        ? anchorRect.top - 10
        : anchorRect.bottom + 10
      : 72;

    if (copyToastTimeoutRef.current) {
      clearTimeout(copyToastTimeoutRef.current);
    }
    setCopyToast({
      visible: true,
      type,
      message,
      left: clampedLeft,
      top,
      above: showAbove,
    });
    copyToastTimeoutRef.current = setTimeout(() => {
      setCopyToast((prev) => ({ ...prev, visible: false }));
    }, 1400);
  }, []);

  const handlePixelSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/pixels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixelId: pixelForm.pixelId,
          tokenEaag: pixelForm.tokenEaag,
          flow: pixelForm.flow,
          geo: pixelForm.geo,
          status: pixelForm.status,
          comment: pixelForm.comment,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save pixel.");
      }
      await fetchPixels();
      resetPixelForm();
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to save pixel." });
    }
  };

  const handlePixelDelete = async (id) => {
    const confirmed = window.confirm("Remove this pixel? This cannot be undone.");
    if (!confirmed) return;
    try {
      const response = await apiFetch(`/api/pixels/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete pixel.");
      }
      await fetchPixels();
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to delete pixel." });
    }
  };

  const handlePixelStatusChange = async (id, status) => {
    try {
      const response = await apiFetch(`/api/pixels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update pixel status.");
      }
      await fetchPixels();
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to update pixel status." });
    }
  };

  const handleCommentEdit = async (pixel) => {
    if (!pixel?.id) return;
    setCommentModal({
      open: true,
      pixel,
      value: pixel.comment || "",
    });
  };

  const closeCommentModal = () => {
    setCommentModal({ open: false, pixel: null, value: "" });
  };

  const handleCommentSave = async () => {
    if (!commentModal.pixel?.id) return;
    try {
      const fallbackStatus = commentModal.pixel.status || "Active";
      const normalizedComment = String(commentModal.value || "").trim();
      const query = new URLSearchParams();
      if (normalizedComment) query.set("comment", normalizedComment);
      if (fallbackStatus) query.set("status", fallbackStatus);
      let response = await apiFetch(
        `/api/pixels/${commentModal.pixel.id}/comment${query.toString() ? `?${query}` : ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment: normalizedComment,
            status: fallbackStatus,
          }),
        }
      );
      if (response.status === 404) {
        response = await apiFetch(
          `/api/pixels/${commentModal.pixel.id}${query.toString() ? `?${query}` : ""}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comment: normalizedComment,
              status: fallbackStatus,
            }),
          }
        );
      }
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "Failed to update comment.");
      }
      const updated = await response.json().catch(() => null);
      if (updated?.id) {
        setPixels((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        setPixels((prev) =>
          prev.map((item) =>
            item.id === commentModal.pixel.id
              ? { ...item, comment: normalizedComment || null }
              : item
          )
        );
      }
      await fetchPixels();
      closeCommentModal();
    } catch (error) {
      setPixelState({ loading: false, error: error.message || "Failed to update comment." });
    }
  };

  const maskToken = (token) => {
    const value = String(token || "");
    if (value.length <= 12) return value;
    return `${value.slice(0, 6)}••••${value.slice(-4)}`;
  };

  const handleCopy = (value) => async (event) => {
    if (!value) return;
    const anchorRect = event?.currentTarget?.getBoundingClientRect?.() || null;
    try {
      await navigator.clipboard?.writeText(String(value));
      showCopyToast("success", t("Has been copied successfully"), anchorRect);
    } catch (error) {
      showCopyToast("error", t("Copy failed"), anchorRect);
    }
  };

  const ownerLookup = React.useMemo(() => {
    if (!users.length) return {};
    return users.reduce((acc, user) => {
      acc[user.id] = user.username;
      return acc;
    }, {});
  }, [users]);

  const resolveOwnerLabel = (pixel) => {
    if (pixel?.owner_id && ownerLookup[pixel.owner_id]) return ownerLookup[pixel.owner_id];
    if (pixel?.owner_id && pixel.owner_id === authUser?.id) return authUser?.username || "You";
    return pixel?.owner_role ? t(pixel.owner_role) : "—";
  };

  const filteredDomains = React.useMemo(() => {
    if (canManagePixels) return domains;
    const loggedIdRaw = authUser?.id;
    const loggedId =
      loggedIdRaw === null || loggedIdRaw === undefined || loggedIdRaw === ""
        ? null
        : Number(loggedIdRaw);
    const hasLoggedId = Number.isFinite(loggedId) && loggedId > 0;
    const loggedRole = normalizeRole(authUser?.role);

    return domains.filter((domain) => {
      const domainOwnerIdRaw = domain.owner_id;
      const domainOwnerId =
        domainOwnerIdRaw === null || domainOwnerIdRaw === undefined || domainOwnerIdRaw === ""
          ? null
          : Number(domainOwnerIdRaw);
      const hasDomainOwnerId = Number.isFinite(domainOwnerId) && domainOwnerId > 0;

      if (hasLoggedId && hasDomainOwnerId && domainOwnerId === loggedId) {
        return true;
      }
      if (!hasDomainOwnerId && loggedRole) {
        return normalizeRole(domain.owner_role) === loggedRole;
      }
      return false;
    });
  }, [domains, authUser?.id, authUser?.role, normalizeRole, canManagePixels]);

  const visiblePixels = React.useMemo(() => {
    if (canManagePixels) return pixels;
    return pixels.filter((pixel) => pixel.owner_id === authUser?.id);
  }, [canManagePixels, pixels, authUser?.id]);

  return (
    <section className="form-section">
      <AnimatePresence>
        {commentModal.open ? (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommentModal}
          >
            <motion.div
              className="modal comment-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">{t("Pixel Comment")}</p>
                  <h2>{t("Add comment")}</h2>
                </div>
                <button className="icon-btn" type="button" onClick={closeCommentModal}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="field">
                  <label>{t("Comment")}</label>
                  <textarea
                    rows={4}
                    value={commentModal.value}
                    onChange={(event) =>
                      setCommentModal((prev) => ({ ...prev, value: event.target.value }))
                    }
                    placeholder={t("Add a comment")}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="ghost" type="button" onClick={closeCommentModal}>
                  {t("Cancel")}
                </button>
                <button className="action-pill" type="button" onClick={handleCommentSave}>
                  {t("Save")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="panel-head">
          <div>
            <h3 className="panel-title">{t("Pixels")}</h3>
            <p className="panel-subtitle">{t("Manage FB pixels and tokens tied to your flows.")}</p>
          </div>
          <button className="action-pill" type="button" onClick={() => setShowForm((v) => !v)}>
            {showForm ? t("Hide Form") : t("Create")}
          </button>
        </div>

        <AnimatePresence>
          {copyToast.visible ? (
            <div
              className={`copy-toast-anchor${copyToast.above ? "" : " is-below"}`}
              style={{ left: copyToast.left, top: copyToast.top }}
            >
              <motion.div
                className={`copy-toast ${copyToast.type}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                {copyToast.type === "success" ? <CheckCircle size={14} /> : <X size={14} />}
                <span>{copyToast.message}</span>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>

        {showForm ? (
          <form className="form-grid pixel-form" onSubmit={handlePixelSubmit}>
            <div className="field">
              <label>{t("Pixel ID")}</label>
              <input
                value={pixelForm.pixelId}
                onChange={updatePixelForm("pixelId")}
                placeholder="7147390541946812"
                required
              />
            </div>
            <div className="field">
              <label>{t("Token EAAG")}</label>
              <input
                value={pixelForm.tokenEaag}
                onChange={updatePixelForm("tokenEaag")}
                placeholder="EAAG..."
                required
              />
            </div>
            <div className="field">
              <label>{t("Flow")}</label>
              <select
                value={pixelForm.flow}
                onChange={updatePixelForm("flow")}
                required
              >
                <option value="">
                  {domainState.loading
                    ? t("Loading...")
                    : filteredDomains.length
                      ? t("Select")
                      : t("No flows")}
                </option>
                {filteredDomains.map((domain) => (
                  <option key={domain.id} value={domain.domain}>
                    {domain.domain}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("GEO")}</label>
              <select value={pixelForm.geo} onChange={updatePixelForm("geo")} required>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("Status")}</label>
              <select value={pixelForm.status} onChange={updatePixelForm("status")}>
                {["Active", "Pending", "Paused", "Expired", "Blocked"].map((status) => (
                  <option key={status} value={status}>
                    {t(status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field field-full">
              <label>{t("Comment")}</label>
              <textarea
                rows={3}
                value={pixelForm.comment}
                onChange={updatePixelForm("comment")}
                placeholder={t("Add a comment")}
              />
            </div>
            <div className="form-actions">
              <button className="ghost" type="button" onClick={resetPixelForm}>
                {t("Reset")}
              </button>
              <button className="action-pill" type="submit">
                {t("Save")}
              </button>
            </div>
          </form>
        ) : null}

        {pixelState.loading ? (
          <div className="empty-state">{t("Loading entries…")}</div>
        ) : pixelState.error ? (
          <div className="empty-state error">{pixelState.error}</div>
        ) : visiblePixels.length === 0 ? (
          <div className="empty-state">{t("No pixels added yet.")}</div>
        ) : (
          <div className="table-wrap">
            <table className="entries-table pixel-table">
              <thead>
                <tr>
                  <th>{t("ID")}</th>
                  <th>{t("Pixel ID")}</th>
                  <th>{t("Token EAAG")}</th>
                  <th>{t("GEO")}</th>
                  <th>{t("Flow")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Comment")}</th>
                  <th>{t("Owner")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visiblePixels.map((pixel) => (
                  <tr key={pixel.id}>
                    <td>{pixel.id}</td>
                    <td className="copy-cell">
                      <div className="copy-inline">
                        <span className="copy-text">{pixel.pixel_id}</span>
                        <button
                          className="icon-btn copy-btn"
                          type="button"
                          onClick={handleCopy(pixel.pixel_id)}
                          title={t("Copy")}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="copy-cell token-cell">
                      <div className="copy-inline">
                        <span className="copy-text">{maskToken(pixel.token_eaag)}</span>
                        <button
                          className="icon-btn copy-btn"
                          type="button"
                          onClick={handleCopy(pixel.token_eaag)}
                          title={t("Copy")}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td>{pixel.geo || "—"}</td>
                    <td>{pixel.flows || "—"}</td>
                    <td>
                      {canManagePixels || pixel.owner_id === authUser?.id ? (
                        <select
                          className={`inline-select status-select status-${(pixel.status || "inactive").toLowerCase()}`}
                          value={pixel.status || "Active"}
                          onChange={(event) =>
                            handlePixelStatusChange(pixel.id, event.target.value)
                          }
                        >
                          {["Active", "Pending", "Paused", "Expired", "Blocked"].map((status) => (
                            <option key={status} value={status}>
                              {t(status)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`status-pill status-${pixel.status?.toLowerCase() || "inactive"}`}>
                          {t(pixel.status || "Active")}
                        </span>
                      )}
                    </td>
                    <td>
                      {pixel.comment ? (
                        pixel.comment
                      ) : (
                        <button
                          className="comment-btn"
                          type="button"
                          onClick={() => handleCommentEdit(pixel)}
                          aria-label={t("Add comment")}
                          title={t("Add comment")}
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </td>
                    <td>{resolveOwnerLabel(pixel)}</td>
                    <td>
                      {canManagePixels ? (
                        <button
                          className="icon-btn danger"
                          type="button"
                          onClick={() => handlePixelDelete(pixel.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </section>
  );
}

function RolesDashboard({ authUser }) {
  const { t } = useLanguage();
  const [roles, setRoles] = React.useState([]);
  const [roleState, setRoleState] = React.useState({ loading: true, error: null });
  const [savingId, setSavingId] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [userState, setUserState] = React.useState({ loading: true, error: null });
  const [buyers, setBuyers] = React.useState([]);
  const [teamState, setTeamState] = React.useState({ loading: true, error: null });
  const [teamForm, setTeamForm] = React.useState({
    name: "",
    role: "Media Buyer",
    country: "Brazil",
    approach: "Paid Social",
    game: "",
    email: "",
    contact: "",
    status: "Active",
  });
  const [userForm, setUserForm] = React.useState({
    username: "",
    password: "",
    role: roleOptions[0],
    buyerId: "",
  });

  const updateTeamForm = (key) => (event) => {
    setTeamForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: "",
      role: "Media Buyer",
      country: "Brazil",
      approach: "Paid Social",
      game: "",
      email: "",
      contact: "",
      status: "Active",
    });
  };

  const fetchRoles = React.useCallback(async () => {
    try {
      setRoleState({ loading: true, error: null });
      const response = await apiFetch("/api/roles?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load roles.");
      }
      const data = await response.json();
      setRoles(data);
      setRoleState({ loading: false, error: null });
    } catch (error) {
      setRoleState({ loading: false, error: error.message || "Failed to load roles." });
    }
  }, []);

  React.useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const fetchUsers = React.useCallback(async () => {
    try {
      setUserState({ loading: true, error: null });
      const response = await apiFetch("/api/users?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load users.");
      }
      const data = await response.json();
      setUsers(data);
      setUserState({ loading: false, error: null });
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to load users." });
    }
  }, []);

  const fetchBuyers = React.useCallback(async () => {
    try {
      setTeamState({ loading: true, error: null });
      const response = await apiFetch("/api/media-buyers?limit=300");
      if (!response.ok) {
        throw new Error("Failed to load media buyers.");
      }
      const data = await response.json();
      setBuyers(data);
      setTeamState({ loading: false, error: null });
    } catch (error) {
      setBuyers([]);
      setTeamState({ loading: false, error: error.message || "Failed to load media buyers." });
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
    fetchBuyers();
  }, [fetchUsers, fetchBuyers]);

  const isLeadership = authUser?.role === "Boss" || authUser?.role === "Team Leader";

  const togglePermission = (roleId, permission) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        if (role.name === "Boss" || role.name === "Team Leader") return role;
        const hasPermission = role.permissions.includes(permission);
        const permissions = hasPermission
          ? role.permissions.filter((item) => item !== permission)
          : [...role.permissions, permission];
        return { ...role, permissions };
      })
    );
  };

  const handleRoleSave = async (role) => {
    if (!isLeadership) return;
    if (role.name === "Boss" || role.name === "Team Leader") return;
    setSavingId(role.id);
    try {
      const response = await apiFetch(`/api/roles/${role.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: role.permissions }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update role.");
      }
      await fetchRoles();
    } catch (error) {
      setRoleState({ loading: false, error: error.message || "Failed to update role." });
    } finally {
      setSavingId(null);
    }
  };

  const handleRoleDelete = async (roleId) => {
    try {
      const response = await apiFetch(`/api/roles/${roleId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete role.");
      }
      await fetchRoles();
    } catch (error) {
      setRoleState({ loading: false, error: error.message || "Failed to delete role." });
    }
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create user.");
      }
      setUserForm({ username: "", password: "", role: roleOptions[0], buyerId: "" });
      await fetchUsers();
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to create user." });
    }
  };

  const handleUserDelete = async (userId) => {
    try {
      const response = await apiFetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete user.");
      }
      await fetchUsers();
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to delete user." });
    }
  };

  const handleUserPasswordReset = async (user) => {
    if (!isLeadership) return;
    const nextPassword = window.prompt(t("Reset Password"), "");
    if (nextPassword === null) return;
    if (!String(nextPassword || "").trim()) {
      setUserState({ loading: false, error: t("Password is required."), });
      return;
    }
    try {
      const response = await apiFetch(`/api/users/${user.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: nextPassword }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update password.");
      }
    } catch (error) {
      setUserState({ loading: false, error: error.message || "Failed to update password." });
    }
  };

  const handleTeamSubmit = async (event) => {
    event.preventDefault();
    if (!isLeadership) return;
    try {
      const response = await apiFetch("/api/media-buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save media buyer.");
      }
      await fetchBuyers();
      resetTeamForm();
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to save media buyer." });
    }
  };

  const handleTeamDelete = async (id) => {
    if (!isLeadership) return;
    try {
      const response = await apiFetch(`/api/media-buyers/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete media buyer.");
      }
      await fetchBuyers();
    } catch (error) {
      setTeamState({ loading: false, error: error.message || "Failed to delete media buyer." });
    }
  };

  const roleNameOptions = roles.length ? roles.map((role) => role.name) : roleOptions;
  const buyerMap = buyers.reduce((acc, buyer) => {
    acc[buyer.id] = buyer.name;
    return acc;
  }, {});
  const buyerTagMap = {
    AKKU: "AKDMC",
    ENZO: "ENDMC",
    "LEO CARVAKHO": "LCDMC",
    CARVALHO: "LCDMC",
    LET: "LNDMC",
    LETICIA: "LNDMC",
    MATHEUS: "MTDMC",
    SARA: "SRDMC",
  };
  const resolveBuyerTag = (username) => {
    if (!username) return null;
    return buyerTagMap[String(username).trim().toUpperCase()] || null;
  };
  const mediaBuyerApproaches = approachOptions.filter((item) => item !== "All");

  return (
    <>
      <section className="form-section">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Roles & Permissions")}</h3>
              <p className="panel-subtitle">{t("Define what each role can access and edit.")}</p>
            </div>
          </div>

          {roleState.loading ? (
            <div className="empty-state">{t("Loading roles…")}</div>
          ) : roleState.error ? (
            <div className="empty-state error">{roleState.error}</div>
          ) : roles.length === 0 ? (
            <div className="empty-state">{t("No roles found.")}</div>
          ) : (
            <div className="role-grid">
              {roles.map((role) => {
                const isLocked = role.name === "Boss" || role.name === "Team Leader";
                const canEdit = isLeadership && !isLocked;
                return (
                <div key={role.id} className="role-card">
                  <div className="role-card-head">
                    <div>
                      <div className="role-name">{t(role.name)}</div>
                      <div className="role-sub">{t("Permissions")}</div>
                    </div>
                    <div className="role-actions">
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => handleRoleSave(role)}
                        disabled={savingId === role.id || !canEdit}
                      >
                        {savingId === role.id ? t("Saving...") : t("Save Changes")}
                      </button>
                      {!isLocked ? (
                        <button className="icon-btn" type="button" onClick={() => handleRoleDelete(role.id)}>
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="role-permissions">
                    {permissionOptions.map((perm) => {
                      const checked = role.permissions.includes(perm.key);
                      return (
                        <label key={perm.key} className={`perm-item${checked ? " is-active" : ""}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(role.id, perm.key)}
                            disabled={!canEdit}
                          />
                          <span>{t(perm.label)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )})}
            </div>
          )}
        </motion.div>
      </section>

      <section className="form-section">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("User Access")}</h3>
              <p className="panel-subtitle">{t("Create Login")}</p>
            </div>
          </div>

          <form className="form-grid user-form" onSubmit={handleUserSubmit}>
            <div className="field">
              <label>{t("Username")}</label>
              <input
                value={userForm.username}
                onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label>{t("Password")}</label>
              <input
                type="password"
                value={userForm.password}
                onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label>{t("Role")}</label>
              <select
                value={userForm.role}
                onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}
              >
                {roleNameOptions.map((role) => (
                  <option key={role} value={role}>
                    {t(role)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("Assign Media Buyer")}</label>
              <select
                value={userForm.buyerId}
                onChange={(event) => setUserForm((prev) => ({ ...prev, buyerId: event.target.value }))}
              >
                <option value="">{t("Media Buyer")}</option>
                {buyers.map((buyer) => (
                  <option key={buyer.id} value={buyer.id}>
                    {buyer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button className="action-pill" type="submit">
                {t("Create Login")}
              </button>
            </div>
          </form>

          {userState.loading ? (
            <div className="empty-state">{t("Loading users…")}</div>
          ) : userState.error ? (
            <div className="empty-state error">{userState.error}</div>
          ) : users.length === 0 ? (
            <div className="empty-state">{t("No users found.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table user-table">
                <thead>
                  <tr>
                    <th>{t("Username")}</th>
                    <th>{t("Role")}</th>
                    <th>{t("Media Buyer")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const buyerName = user.buyer_id ? buyerMap[user.buyer_id] || "" : "";
                    const buyerTag = resolveBuyerTag(user.username);
                    return (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{t(user.role)}</td>
                        <td>
                          <div className="buyer-cell">
                            {buyerName ? <span>{buyerName}</span> : buyerTag ? null : "—"}
                            {buyerTag ? <span className="tag-pill">{buyerTag}</span> : null}
                          </div>
                        </td>
                        <td>
                          {isLeadership ? (
                            <div className="row-actions">
                              <button
                                className="icon-btn"
                                type="button"
                                onClick={() => handleUserPasswordReset(user)}
                                title={t("Reset Password")}
                              >
                                <Lock size={16} />
                              </button>
                              <button
                                className="icon-btn"
                                type="button"
                                onClick={() => handleUserDelete(user.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>

      <section className="form-section">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Media Buyer Directory")}</h3>
              <p className="panel-subtitle">
                {t("Identify your team members and keep contact details organized.")}
              </p>
            </div>
          </div>

          {isLeadership ? (
            <form className="form-grid team-form" onSubmit={handleTeamSubmit}>
              <div className="field">
                <label>{t("Name")}</label>
                <input
                  value={teamForm.name}
                  onChange={updateTeamForm("name")}
                  placeholder={t("Full name")}
                  required
                />
              </div>
              <div className="field">
                <label>{t("Role")}</label>
                <select value={teamForm.role} onChange={updateTeamForm("role")}>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {t(role)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t("Country")}</label>
                <select value={teamForm.country} onChange={updateTeamForm("country")}>
                  {countryOptions.map((country) => (
                    <option key={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t("Approach")}</label>
                <select value={teamForm.approach} onChange={updateTeamForm("approach")}>
                  {mediaBuyerApproaches.map((approach) => (
                    <option key={approach} value={approach}>
                      {t(approach)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t("Game")}</label>
                <input
                  value={teamForm.game}
                  onChange={updateTeamForm("game")}
                  placeholder={t("e.g. Crash, Roulette")}
                />
              </div>
              <div className="field">
                <label>{t("Email")}</label>
                <input
                  type="email"
                  value={teamForm.email}
                  onChange={updateTeamForm("email")}
                  placeholder="buyer@domain.com"
                />
              </div>
              <div className="field">
                <label>{t("Contact")}</label>
                <input
                  value={teamForm.contact}
                  onChange={updateTeamForm("contact")}
                  placeholder="Telegram / WhatsApp"
                />
              </div>
              <div className="field">
                <label>{t("Status")}</label>
                <select value={teamForm.status} onChange={updateTeamForm("status")}>
                  {["Active", "Onboarding", "Inactive"].map((status) => (
                    <option key={status} value={status}>
                      {t(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button className="ghost" type="button" onClick={resetTeamForm}>
                  {t("Reset")}
                </button>
                <button className="action-pill" type="submit">
                  {t("Add Member")}
                </button>
              </div>
            </form>
          ) : (
            <div className="empty-state">{t("Media buyer management is restricted to leadership.")}</div>
          )}

          {teamState.loading ? (
            <div className="empty-state">{t("Loading team…")}</div>
          ) : teamState.error ? (
            <div className="empty-state error">{teamState.error}</div>
          ) : buyers.length === 0 ? (
            <div className="empty-state">{t("No media buyers added yet.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table team-table">
                <thead>
                  <tr>
                    <th>{t("Name")}</th>
                    <th>{t("Role")}</th>
                    <th>{t("Country")}</th>
                    <th>{t("Approach")}</th>
                    <th>{t("Game")}</th>
                    <th>{t("Email")}</th>
                    <th>{t("Contact")}</th>
                    <th>{t("Status")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{t(member.role)}</td>
                      <td>{member.country || "—"}</td>
                      <td>{member.approach ? t(member.approach) : "—"}</td>
                      <td>{member.game || "—"}</td>
                      <td>{member.email || "—"}</td>
                      <td>{member.contact || "—"}</td>
                      <td>
                        <span className={`status-pill status-${member.status?.toLowerCase() || "inactive"}`}>
                          {member.status ? t(member.status) : t("Inactive")}
                        </span>
                      </td>
                      <td>
                        {isLeadership ? (
                          <button className="icon-btn" type="button" onClick={() => handleTeamDelete(member.id)}>
                            <Trash2 size={16} />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

function ProfileDashboard({ authUser }) {
  const { t } = useLanguage();
  const [profileState, setProfileState] = React.useState({ loading: true, error: null });
  const [userRecord, setUserRecord] = React.useState(null);
  const [roleRecord, setRoleRecord] = React.useState(null);
  const [buyerRecord, setBuyerRecord] = React.useState(null);
  const [passwordForm, setPasswordForm] = React.useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordState, setPasswordState] = React.useState({
    loading: false,
    error: null,
    success: null,
  });

  const loadProfile = React.useCallback(async () => {
    try {
      setProfileState({ loading: true, error: null });
      const [usersRes, rolesRes, buyersRes] = await Promise.all([
        apiFetch("/api/users?limit=300"),
        apiFetch("/api/roles?limit=200"),
        apiFetch("/api/media-buyers?limit=300"),
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const roles = rolesRes.ok ? await rolesRes.json() : [];
      const buyers = buyersRes.ok ? await buyersRes.json() : [];

      const currentUser =
        users.find((user) => user.id === authUser?.id) ||
        users.find((user) => user.username === authUser?.username) ||
        null;
      const resolvedBuyerId = currentUser?.buyer_id ?? authUser?.buyerId ?? null;
      const buyer = buyers.find((item) => item.id === resolvedBuyerId) || null;
      const role = roles.find((item) => item.name === (currentUser?.role || authUser?.role)) || null;

      setUserRecord(currentUser);
      setBuyerRecord(buyer);
      setRoleRecord(role);
      setProfileState({ loading: false, error: null });
    } catch (error) {
      setProfileState({ loading: false, error: error.message || "Failed to load profile." });
    }
  }, [authUser?.id, authUser?.username, authUser?.buyerId, authUser?.role]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const username = userRecord?.username || authUser?.username || "—";
  const roleName = userRecord?.role || authUser?.role || "—";
  const buyerName = buyerRecord?.name || t("No buyer linked");
  const verified = userRecord?.verified ? t("Verified") : t("Unverified");
  const permissions = roleRecord?.permissions || [];

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordState({ loading: false, error: t("Passwords do not match."), success: null });
      return;
    }
    try {
      setPasswordState({ loading: true, error: null, success: null });
      const response = await apiFetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update password.");
      }
      setPasswordForm({ current: "", next: "", confirm: "" });
      setPasswordState({ loading: false, error: null, success: t("Password updated.") });
    } catch (error) {
      setPasswordState({
        loading: false,
        error: error.message || "Failed to update password.",
        success: null,
      });
    }
  };

  return (
    <>
      <section className="cards">
        {[
          { label: "Username", value: username, meta: "Account Overview", icon: User },
          { label: "Role", value: t(roleName), meta: "Access Level", icon: ShieldCheck },
          { label: "Media Buyer", value: buyerName, meta: "Assigned Media Buyer", icon: Target },
          { label: "Status", value: verified, meta: "Account Status", icon: CheckCircle },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="card-head">
                <Icon size={18} />
                {t(stat.label)}
              </div>
              <div className="card-value">{stat.value}</div>
              <div className="card-meta">{t(stat.meta)}</div>
            </div>
          );
        })}
      </section>

      <section className="panels profile-panels">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Profile Details")}</h3>
              <p className="panel-subtitle">{t("Your profile in the top right shows the active user and role.")}</p>
            </div>
          </div>
          {profileState.loading ? (
            <div className="empty-state">{t("Loading profile…")}</div>
          ) : profileState.error ? (
            <div className="empty-state error">{profileState.error}</div>
          ) : (
            <div className="profile-info-grid">
              <div className="profile-info">
                <span>{t("User ID")}</span>
                <strong>{userRecord?.id ?? authUser?.id ?? "—"}</strong>
              </div>
              <div className="profile-info">
                <span>{t("Username")}</span>
                <strong>{username}</strong>
              </div>
              <div className="profile-info">
                <span>{t("Role")}</span>
                <strong>{t(roleName)}</strong>
              </div>
              <div className="profile-info">
                <span>{t("Buyer ID")}</span>
                <strong>{buyerRecord?.id ?? authUser?.buyerId ?? "—"}</strong>
              </div>
              <div className="profile-info">
                <span>{t("Media Buyer")}</span>
                <strong>{buyerName}</strong>
              </div>
              <div className="profile-info">
                <span>{t("Account Status")}</span>
                <strong>{verified}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Change Password")}</h3>
              <p className="panel-subtitle">{t("Secure login")}</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handlePasswordChange}>
            <div className="field">
              <label>{t("Current Password")}</label>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, current: event.target.value }))
                }
                required
              />
            </div>
            <div className="field">
              <label>{t("New Password")}</label>
              <input
                type="password"
                value={passwordForm.next}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, next: event.target.value }))
                }
                required
              />
            </div>
            <div className="field">
              <label>{t("Confirm Password")}</label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))
                }
                required
              />
            </div>
            <div className="form-actions">
              <button className="action-pill" type="submit" disabled={passwordState.loading}>
                {passwordState.loading ? t("Saving...") : t("Update Password")}
              </button>
            </div>
            {passwordState.error ? (
              <div className="form-error">{passwordState.error}</div>
            ) : null}
            {passwordState.success ? (
              <div className="form-success">{passwordState.success}</div>
            ) : null}
          </form>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Role Permissions")}</h3>
              <p className="panel-subtitle">{t("Permissions granted by your role.")}</p>
            </div>
          </div>
          {profileState.loading ? (
            <div className="empty-state">{t("Loading profile…")}</div>
          ) : permissions.length === 0 ? (
            <div className="empty-state">{t("No permissions assigned.")}</div>
          ) : (
            <div className="role-permissions">
              {permissions.map((perm) => (
                <div key={perm} className="perm-item is-active">
                  <span>{t(permissionOptions.find((opt) => opt.key === perm)?.label || perm)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function DocumentationDashboard() {
  const { t } = useLanguage();
  const sections = [
    {
      icon: CheckCircle,
      title: t("Getting Started"),
      description: t(
        "Use your assigned username and password to sign in. Your role controls what you can view and edit."
      ),
      bullets: [
        t("Use the sidebar to navigate modules."),
        t("Use the language switcher at the bottom to toggle EN / TR."),
        t("Your profile in the top right shows the active user and role."),
      ],
    },
    {
      icon: Home,
      title: t("Home Dashboard"),
      description: t("Quick overview of clicks, installs, registers, FTDs, and conversion rates."),
      bullets: [
        t("Use the period selector for time ranges."),
        t("Charts show conversion rates and top GEO distribution."),
        t("Filters apply to Home and Finances."),
      ],
    },
    {
      icon: Target,
      title: t("Goals"),
      description: t("Set targets for FTDs and Reg2Dep conversion by media buyer, country, and period."),
      bullets: [
        t("Define period or custom date range."),
        t("Goal overview banner summarizes progress."),
        t("Track status: achieved, on track, or behind."),
      ],
    },
    {
      icon: Wallet,
      title: t("Finances"),
      description: t("Manual expense entry with billing type and status. Charts update automatically."),
      bullets: [
        t("Fields: date, country, category, reference, billing type, amount, status."),
        t("Totals and averages refresh on save."),
        t("Monthly and category charts visualize spend."),
      ],
    },
    {
      icon: BarChart3,
      title: t("Statistics"),
      description: t(
        "Enter daily performance per media buyer and country; the system calculates funnel and cost metrics."
      ),
      bullets: [
        t("Inputs: date, spend, clicks, installs, registers, FTDs, country."),
        t("Derived metrics: Click2Install, Click2Register, Install2Reg, Reg2Dep."),
        t("Cost metrics: CPC, CPI, CPR, CPP."),
      ],
    },
    {
      icon: Smartphone,
      title: t("Devices"),
      description: t("Analyze device performance for clicks, installs, revenue, and CR."),
      bullets: [
        t("Sync device reports from Keitaro."),
        t("Installs come from your postback receiver."),
        t("Compare revenue and conversion rates per device."),
      ],
    },
    {
      icon: Link2,
      title: t("UTM Builder"),
      description: t("Generate tracking links with fbp and sub1-sub15 parameters."),
      bullets: [
        t("Enter the base domain."),
        t("Fill fbp and any sub fields you need."),
        t("Only filled parameters are added to the final URL."),
      ],
    },
    {
      icon: Globe,
      title: t("Domains"),
      description: t("Keep a registry of your landing domains and status."),
      bullets: [
        t("Add domains with status and notes."),
        t("Use statuses to track availability."),
        t("Domains list shows the latest entries."),
      ],
    },
    {
      icon: ShieldCheck,
      title: t("Roles & Users"),
      description: t("Manage roles, permissions, and verified user access."),
      bullets: [
        t("Create roles and toggle permissions."),
        t("Assign roles when creating users."),
        t("Verified users can access the platform."),
      ],
    },
    {
      icon: Plug,
      title: t("API"),
      description: t("Connect Keitaro to pull performance data automatically."),
      bullets: [
        t("Configure endpoint, API key, and payload mapping."),
        t("Keitaro syncs registrations, FTDs, and redeposits. Installs come via postback."),
        t("Use Sync to fetch data."),
        t("Status panel shows last sync."),
      ],
    },
  ];

  return (
    <>
      <section className="docs-hero">
        <div>
          <span className="docs-kicker">{t("System Documentation")}</span>
          <h2 className="docs-title">{t("Documentation")}</h2>
          <p className="docs-sub">
            {t("Everything you need to operate the dashboard, manage data, and onboard media buyers.")}
          </p>
        </div>
        <div className="docs-hero-meta">
          <div className="docs-meta-card">
            <span>{t("Sections")}</span>
            <strong>{sections.length}</strong>
          </div>
          <div className="docs-meta-card">
            <span>{t("Data")}</span>
            <strong>{t("Local SQLite")}</strong>
          </div>
          <div className="docs-meta-card">
            <span>{t("Access")}</span>
            <strong>{t("Role-based")}</strong>
          </div>
        </div>
      </section>

      <section className="docs-grid">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              className="doc-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <div className="doc-card-head">
                <span className="doc-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </div>
              </div>
              <ul className="doc-list">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </section>

      <section className="docs-callout">
        <div>
          <h3>{t("Best Practices")}</h3>
          <p className="docs-sub">{t("Keep entries consistent by date and country.")}</p>
        </div>
        <ul className="doc-list">
          <li>{t("Review goals weekly and adjust caps.")}</li>
          <li>{t("Use UTM templates per buyer to avoid mistakes.")}</li>
        </ul>
      </section>
    </>
  );
}

function KeitaroApiView() {
  const { t } = useLanguage();
  const storageKey = "keitaro-config-v1";
  const stored = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (error) {
      return {};
    }
  }, []);
  const initialSyncTarget = stored.syncTarget || "overall";

  const [baseUrl, setBaseUrl] = React.useState(stored.baseUrl || "");
  const [apiKey, setApiKey] = React.useState(stored.rememberKey ? stored.apiKey || "" : "");
  const [reportPath, setReportPath] = React.useState(stored.reportPath || "/admin_api/v1/report/build");
  const [payloadText, setPayloadText] = React.useState(
    stored.payloadText || defaultKeitaroPayloadByTarget[initialSyncTarget] || defaultKeitaroPayload
  );
  const [mapping, setMapping] = React.useState({ ...defaultKeitaroMapping, ...(stored.mapping || {}) });
  const [syncTarget, setSyncTarget] = React.useState(initialSyncTarget);
  const [replaceExisting, setReplaceExisting] = React.useState(
    stored.replaceExisting === undefined ? true : stored.replaceExisting
  );
  const [rememberKey, setRememberKey] = React.useState(Boolean(stored.rememberKey));
  const [testState, setTestState] = React.useState({ loading: false, ok: null, message: "" });
  const [syncState, setSyncState] = React.useState({ loading: false, ok: null, message: "" });
  const [syncResult, setSyncResult] = React.useState(null);
  const [showMapping, setShowMapping] = React.useState(true);
  const previousSyncTargetRef = React.useRef(initialSyncTarget);
  const [campaigns, setCampaigns] = React.useState([]);
  const [campaignState, setCampaignState] = React.useState({ loading: true, error: null });
  const [campaignForm, setCampaignForm] = React.useState({
    keitaroId: "",
    name: "",
    buyer: "",
    country: "",
    domain: "",
  });

  const postbackUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/install`;
  }, []);

  const postbackFtdUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/ftd`;
  }, []);

  const postbackRegistrationUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/registration`;
  }, []);

  const postbackRedepositUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/redeposit`;
  }, []);

  const postbackExample = postbackUrl
    ? `${postbackUrl}?external_id={pwauid}&country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackFtdExample = postbackFtdUrl
    ? `${postbackFtdUrl}?country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackRegistrationExample = postbackRegistrationUrl
    ? `${postbackRegistrationUrl}?country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackRedepositExample = postbackRedepositUrl
    ? `${postbackRedepositUrl}?country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackItems = [
    {
      key: "install",
      title: "Install Postback Receiver",
      subtitle: "Receive install events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackUrl,
      example: postbackExample,
    },
    {
      key: "registration",
      title: "Registration Postback Receiver",
      subtitle:
        "Receive registration events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackRegistrationUrl,
      example: postbackRegistrationExample,
    },
    {
      key: "ftd",
      title: "FTD Postback Receiver",
      subtitle: "Receive FTD events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackFtdUrl,
      example: postbackFtdExample,
    },
    {
      key: "redeposit",
      title: "Redeposit Postback Receiver",
      subtitle:
        "Receive redeposit events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackRedepositUrl,
      example: postbackRedepositExample,
    },
  ];

  React.useEffect(() => {
    const previousTarget = previousSyncTargetRef.current;
    if (previousTarget === syncTarget) return;
    const previousDefault = defaultKeitaroPayloadByTarget[previousTarget] || defaultKeitaroPayload;
    const nextDefault = defaultKeitaroPayloadByTarget[syncTarget] || defaultKeitaroPayload;
    const currentText = String(payloadText || "").trim();
    if (!currentText || currentText === String(previousDefault).trim()) {
      setPayloadText(nextDefault);
    }
    previousSyncTargetRef.current = syncTarget;
  }, [syncTarget, payloadText]);

  React.useEffect(() => {
    const payload = {
      baseUrl,
      reportPath,
      payloadText,
      mapping,
      syncTarget,
      replaceExisting,
      rememberKey,
    };
    if (rememberKey) {
      payload.apiKey = apiKey;
    }
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [baseUrl, reportPath, payloadText, mapping, syncTarget, replaceExisting, rememberKey, apiKey]);

  const handleMappingChange = (key) => (event) => {
    setMapping((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const ensurePayloadField = React.useCallback((payload, field) => {
    if (!payload || typeof payload !== "object" || !field) return payload;
    const normalizedField = String(field).trim();
    if (!normalizedField) return payload;

    const hasDimensions = Array.isArray(payload.dimensions);
    const hasGrouping = Array.isArray(payload.grouping);
    const normalized = normalizedField.toLowerCase();

    const appendField = (items) => {
      const nextItems = [...items];
      const exists = nextItems.some(
        (item) => String(item || "").trim().toLowerCase() === normalized
      );
      if (!exists) {
        nextItems.push(normalizedField);
      }
      return nextItems;
    };

    if (hasDimensions || hasGrouping) {
      const nextPayload = { ...payload };
      if (hasDimensions) {
        nextPayload.dimensions = appendField(payload.dimensions);
      }
      if (hasGrouping) {
        nextPayload.grouping = appendField(payload.grouping);
      }
      return nextPayload;
    }

    return { ...payload, dimensions: [normalizedField] };
  }, []);

  const ensurePayloadMeasure = React.useCallback((payload, measure) => {
    if (!payload || typeof payload !== "object" || !measure) return payload;
    const normalizedMeasure = String(measure).trim();
    if (!normalizedMeasure) return payload;
    const lower = normalizedMeasure.toLowerCase();
    const appendMeasure = (items) => {
      const nextItems = Array.isArray(items) ? [...items] : [];
      const exists = nextItems.some(
        (item) => String(item || "").trim().toLowerCase() === lower
      );
      if (!exists) {
        nextItems.push(normalizedMeasure);
      }
      return nextItems;
    };

    const nextPayload = { ...payload, measures: appendMeasure(payload.measures) };
    if (Array.isArray(payload.metrics)) {
      nextPayload.metrics = appendMeasure(payload.metrics);
    }
    return nextPayload;
  }, []);

  const fetchCampaigns = React.useCallback(async () => {
    try {
      setCampaignState({ loading: true, error: null });
      const response = await apiFetch("/api/campaigns?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load campaigns.");
      }
      const data = await response.json();
      setCampaigns(data);
      setCampaignState({ loading: false, error: null });
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to load campaigns." });
    }
  }, []);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const updateCampaignForm = (key) => (event) => {
    setCampaignForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetCampaignForm = () => {
    setCampaignForm({ keitaroId: "", name: "", buyer: "", country: "", domain: "" });
  };

  const handleCampaignSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save campaign.");
      }
      await fetchCampaigns();
      resetCampaignForm();
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to save campaign." });
    }
  };

  const handleCampaignDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete campaign.");
      }
      await fetchCampaigns();
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to delete campaign." });
    }
  };

  const handleCopyPostback = (value) => async () => {
    if (!value) return;
    try {
      await navigator.clipboard?.writeText(value);
    } catch (error) {
      // ignore clipboard failure
    }
  };

  const handleTest = async () => {
    setTestState({ loading: true, ok: null, message: "" });
    try {
      const response = await apiFetch("/api/keitaro/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, apiKey }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Connection failed.");
      }
      setTestState({ loading: false, ok: true, message: "Connection verified." });
    } catch (error) {
      setTestState({ loading: false, ok: false, message: error.message || "Connection failed." });
    }
  };

  const handleSync = async () => {
    setSyncState({ loading: true, ok: null, message: "" });
    setSyncResult(null);
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (error) {
      setSyncState({ loading: false, ok: false, message: "Report payload must be valid JSON." });
      return;
    }

    const normalizeMeasures = (items) =>
      items.map((item) => {
        const key = String(item || "").trim().toLowerCase();
        if (key === "registrations" || key === "registration") return "regs";
        if (key === "ftd" || key === "ftds") return "custom_conversion_8";
        if (key === "redeposit" || key === "redeposits") return "custom_conversion_7";
        return item;
      });
    if (parsedPayload && typeof parsedPayload === "object") {
      if (Array.isArray(parsedPayload.measures)) {
        parsedPayload = { ...parsedPayload, measures: normalizeMeasures(parsedPayload.measures) };
      }
      if (Array.isArray(parsedPayload.metrics)) {
        parsedPayload = { ...parsedPayload, metrics: normalizeMeasures(parsedPayload.metrics) };
      }
    }

    if (syncTarget === "overall") {
      [
        mapping.dateField || defaultKeitaroMapping.dateField,
        mapping.buyerField || defaultKeitaroMapping.buyerField,
        mapping.countryField || defaultKeitaroMapping.countryField,
        mapping.cityField || defaultKeitaroMapping.cityField,
        mapping.regionField || defaultKeitaroMapping.regionField,
        mapping.placementField || defaultKeitaroMapping.placementField,
        mapping.domainField || defaultKeitaroMapping.domainField,
        mapping.campaignNameField || defaultKeitaroMapping.campaignNameField,
        mapping.adsetNameField || defaultKeitaroMapping.adsetNameField,
        mapping.adNameField || defaultKeitaroMapping.adNameField,
      ].forEach((field) => {
        parsedPayload = ensurePayloadField(parsedPayload, field);
      });
      [
        mapping.spendField || defaultKeitaroMapping.spendField,
        mapping.clicksField || defaultKeitaroMapping.clicksField,
        mapping.registersField || defaultKeitaroMapping.registersField,
        mapping.ftdsField || defaultKeitaroMapping.ftdsField,
        mapping.redepositsField || defaultKeitaroMapping.redepositsField,
        mapping.ftdRevenueField || defaultKeitaroMapping.ftdRevenueField,
        mapping.redepositRevenueField || defaultKeitaroMapping.redepositRevenueField,
      ].forEach((measure) => {
        parsedPayload = ensurePayloadMeasure(parsedPayload, measure);
      });
    } else if (syncTarget === "user_behavior") {
      [
        mapping.dateField || defaultKeitaroMapping.dateField,
        mapping.buyerField || defaultKeitaroMapping.buyerField,
        mapping.campaignField || defaultKeitaroMapping.campaignField,
        mapping.countryField || defaultKeitaroMapping.countryField,
        mapping.regionField || defaultKeitaroMapping.regionField,
        mapping.cityField || defaultKeitaroMapping.cityField,
        mapping.placementField || defaultKeitaroMapping.placementField,
        mapping.externalIdField || defaultKeitaroMapping.externalIdField,
      ].forEach((field) => {
        parsedPayload = ensurePayloadField(parsedPayload, field);
      });
      [
        mapping.clicksField || defaultKeitaroMapping.clicksField,
        mapping.registersField || defaultKeitaroMapping.registersField,
        mapping.ftdsField || defaultKeitaroMapping.ftdsField,
        mapping.redepositsField || defaultKeitaroMapping.redepositsField,
        mapping.ftdRevenueField || defaultKeitaroMapping.ftdRevenueField,
        mapping.redepositRevenueField || defaultKeitaroMapping.redepositRevenueField,
      ].forEach((measure) => {
        parsedPayload = ensurePayloadMeasure(parsedPayload, measure);
      });
    } else {
      [
        mapping.dateField || defaultKeitaroMapping.dateField,
        mapping.buyerField || defaultKeitaroMapping.buyerField,
        mapping.countryField || defaultKeitaroMapping.countryField,
        mapping.deviceField || defaultKeitaroMapping.deviceField,
        mapping.osField || defaultKeitaroMapping.osField,
        mapping.osVersionField || defaultKeitaroMapping.osVersionField,
        mapping.deviceModelField || defaultKeitaroMapping.deviceModelField,
      ].forEach((field) => {
        parsedPayload = ensurePayloadField(parsedPayload, field);
      });
      [
        mapping.spendField || defaultKeitaroMapping.spendField,
        mapping.revenueField || defaultKeitaroMapping.revenueField,
        mapping.clicksField || defaultKeitaroMapping.clicksField,
        mapping.registersField || defaultKeitaroMapping.registersField,
        mapping.ftdsField || defaultKeitaroMapping.ftdsField,
        mapping.redepositsField || defaultKeitaroMapping.redepositsField,
      ].forEach((measure) => {
        parsedPayload = ensurePayloadMeasure(parsedPayload, measure);
      });
    }

    try {
      let response = await apiFetch("/api/keitaro/sync?async=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl,
          apiKey,
          reportPath,
          payload: parsedPayload,
          mapping,
          replaceExisting,
          target: syncTarget,
          async: true,
        }),
      });
      if (response.status === 404 || response.status === 405) {
        response = await apiFetch("/api/keitaro/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            baseUrl,
            apiKey,
            reportPath,
            payload: parsedPayload,
            mapping,
            replaceExisting,
            target: syncTarget,
          }),
        });
      }
      if (response.status === 504 || response.status === 502) {
        throw new Error(
          "Gateway timeout. Backend is still running sync in foreground. Redeploy Render with the latest backend code."
        );
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Sync failed.");
      }
      if (data?.async) {
        setSyncState({
          loading: false,
          ok: true,
          message: "Sync started. Refresh in a few minutes to see results.",
        });
        setSyncResult(null);
      } else {
        setSyncState({ loading: false, ok: true, message: "Sync complete." });
        setSyncResult(data);
        window.dispatchEvent(new Event("keitaro:sync"));
      }
    } catch (error) {
      setSyncState({ loading: false, ok: false, message: error.message || "Sync failed." });
    }
  };

  const [postbackLogs, setPostbackLogs] = React.useState([]);
  const [postbackLogState, setPostbackLogState] = React.useState({
    loading: false,
    error: null,
  });

  const fetchPostbackLogs = React.useCallback(async () => {
    try {
      setPostbackLogState({ loading: true, error: null });
      const response = await apiFetch("/api/postbacks/logs?limit=10");
      if (!response.ok) {
        throw new Error("Failed to load postback logs.");
      }
      const data = await response.json();
      setPostbackLogs(Array.isArray(data) ? data : []);
      setPostbackLogState({ loading: false, error: null });
    } catch (error) {
      setPostbackLogState({
        loading: false,
        error: error.message || "Failed to load postback logs.",
      });
    }
  }, []);

  React.useEffect(() => {
    fetchPostbackLogs();
  }, [fetchPostbackLogs]);

  const formatLogTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return String(value);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEventLabel = (value) => {
    const label = String(value || "").toLowerCase();
    if (label === "ftd") return "FTD";
    if (label === "redeposit") return "Redeposit";
    if (label === "registration") return "Registration";
    if (label === "install") return "Install";
    return label || "—";
  };

  const visiblePostbackLogs = React.useMemo(
    () => postbackLogs.slice(0, 10),
    [postbackLogs]
  );

  return (
    <>
      <section className="panels api-stack">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head api-head">
            <div>
              <span className="api-step">{t("Step 1")}</span>
              <h3 className="panel-title">{t("Keitaro Connection")}</h3>
              <p className="panel-subtitle">{t("Connect your tracker and validate the Admin API key.")}</p>
            </div>
          </div>

          <div className="api-banner">
            <div>
              <strong>{t("Connection checklist")}</strong>
              <p>{t("Base URL, API key, and report endpoint are required before syncing.")}</p>
            </div>
          </div>

          <div className="form-grid api-grid">
            <div className="field">
              <label>{t("Base URL")}</label>
              <input
                type="text"
                placeholder="https://tracker.yourdomain.com"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("API Key")}</label>
              <input
                type="password"
                placeholder="Keitaro API key"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("Report Endpoint")}</label>
              <input
                type="text"
                value={reportPath}
                onChange={(event) => setReportPath(event.target.value)}
              />
              <p className="field-hint">{t("Default Keitaro report endpoint.")}</p>
            </div>
            <div className="field field-inline">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={rememberKey}
                  onChange={(event) => setRememberKey(event.target.checked)}
                />
                {t("Remember API key locally")}
              </label>
              <p className="field-hint">{t("Stored only in your browser.")}</p>
            </div>
          </div>

          <div className="api-actions">
            {testState.message && (
              <div className={`api-status ${testState.ok ? "success" : "error"}`}>
                {testState.message}
              </div>
            )}
            <button className="ghost" type="button" onClick={handleTest} disabled={testState.loading}>
              {testState.loading ? t("Testing...") : t("Test Connection")}
            </button>
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <div className="panel-head api-head">
            <div>
              <span className="api-step">{t("Step 2")}</span>
              <h3 className="panel-title">{t("Postback Receivers")}</h3>
              <p className="panel-subtitle">
                {t("Use these endpoints to attach events to Keitaro campaigns.")}
              </p>
            </div>
          </div>

          <div className="postback-info">
            <div>
              <span className="panel-mini">{t("Required parameters")}</span>
              <p>{t("Provide buyer and domain (or campaign_id) for attribution.")}</p>
            </div>
            <div>
              <span className="panel-mini">{t("Optional parameters")}</span>
              <p>{t("external_id, country, buyer, domain, device, status, payout.")}</p>
            </div>
          </div>

          <div className="postback-grid">
            {postbackItems.map((item) => (
              <div className="postback-card" key={item.key}>
                <div className="postback-card-head">
                  <div className="panel-title">{t(item.title)}</div>
                  <div className="panel-subtitle">{t(item.subtitle)}</div>
                </div>
                <div className="postback-url">
                  <input className="code-input" value={item.url} readOnly />
                  <button className="ghost" type="button" onClick={handleCopyPostback(item.url)}>
                    <Copy size={14} />
                    {t("Copy URL")}
                  </button>
                </div>
                {item.example ? (
                  <div className="postback-section">
                    <span className="panel-mini">{t("Example request")}</span>
                    <code className="postback-example">{item.example}</code>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="api-section postback-logs">
            <div className="api-section-head">
              <div>
                <h4 className="panel-title">{t("Postback Logs")}</h4>
                <p className="panel-subtitle">{t("Latest events received from postbacks.")}</p>
              </div>
              <button
                className="ghost"
                type="button"
                onClick={fetchPostbackLogs}
                disabled={postbackLogState.loading}
              >
                {postbackLogState.loading ? t("Refreshing...") : t("Refresh")}
              </button>
            </div>

            {postbackLogState.error ? (
              <div className="api-status error">{postbackLogState.error}</div>
            ) : postbackLogs.length === 0 ? (
              <div className="empty-state">{t("No postback logs yet.")}</div>
            ) : (
              <div>
                <div className="table-wrap">
                  <table className="entries-table postback-table">
                    <thead>
                      <tr>
                        <th>{t("Time")}</th>
                        <th>{t("Event")}</th>
                        <th>{t("Media Buyer")}</th>
                        <th>{t("Domain")}</th>
                        <th>{t("Country")}</th>
                        <th>{t("External ID")}</th>
                        <th>{t("Source")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePostbackLogs.map((row) => (
                        <tr key={row.id}>
                          <td>{formatLogTime(row.created_at || row.date)}</td>
                          <td>
                            <span className={`postback-event ${String(row.event_type || "").toLowerCase()}`}>
                              {formatEventLabel(row.event_type)}
                            </span>
                          </td>
                          <td>{row.buyer || "—"}</td>
                          <td>{row.domain || "—"}</td>
                          <td>{row.country || "—"}</td>
                          <td className="mono">{row.external_id || "—"}</td>
                          <td>{row.source || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="panel-head api-head">
            <div>
              <span className="api-step">{t("Step 3")}</span>
              <h3 className="panel-title">{t("Report Sync")}</h3>
              <p className="panel-subtitle">
                {t("Paste a Keitaro report payload and map fields into your statistics table.")}
              </p>
            </div>
          </div>

          <div className="api-subgrid">
            <div className="field">
              <label>{t("Sync Target")}</label>
              <select value={syncTarget} onChange={(event) => setSyncTarget(event.target.value)}>
                <option value="overall">{t("Overall Stats")}</option>
                <option value="device">{t("Device Stats")}</option>
                <option value="user_behavior">{t("User Behavior")}</option>
              </select>
              <p className="field-hint">{t("Choose where the report data should be stored.")}</p>
            </div>
            <div className="field field-inline">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(event) => setReplaceExisting(event.target.checked)}
                />
                {t("Replace existing entries for the same date + buyer + country")}
              </label>
            </div>
          </div>

          <div className="field">
            <label>{t("Report Payload (JSON)")}</label>
            <textarea
              className="code-input"
              value={payloadText}
              onChange={(event) => setPayloadText(event.target.value)}
            />
            <p className="field-hint">
              {t(
                "Tip: open a Keitaro report, copy the request payload from your browser network tab, and paste it here."
              )}
            </p>
          </div>

          <div className="api-section">
            <div className="api-section-head">
              <div>
                <h4 className="panel-mini">{t("Field Mapping")}</h4>
                <p className="panel-subtitle">
                  {t("Map Keitaro fields to dashboard columns.")}
                </p>
              </div>
              <button className="ghost" type="button" onClick={() => setShowMapping((prev) => !prev)}>
                {showMapping ? t("Hide Mapping") : t("Show Mapping")}
              </button>
            </div>
            {showMapping ? (
              <div className="mapping-grid">
                <div className="mapping-group">
                  <h5>{t("Identity Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Date Field")}</label>
                      <input value={mapping.dateField} onChange={handleMappingChange("dateField")} />
                    </div>
                    <div className="field">
                      <label>{t("Buyer Field")}</label>
                      <input value={mapping.buyerField} onChange={handleMappingChange("buyerField")} />
                    </div>
                    <div className="field">
                      <label>{t("Campaign Field")}</label>
                      <input
                        value={mapping.campaignField || ""}
                        onChange={handleMappingChange("campaignField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("External ID Field")}</label>
                      <input
                        value={mapping.externalIdField || ""}
                        onChange={handleMappingChange("externalIdField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Geo Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Country Field")}</label>
                      <input value={mapping.countryField} onChange={handleMappingChange("countryField")} />
                    </div>
                    <div className="field">
                      <label>{t("Region Field")}</label>
                      <input value={mapping.regionField || ""} onChange={handleMappingChange("regionField")} />
                    </div>
                    <div className="field">
                      <label>{t("City Field")}</label>
                      <input value={mapping.cityField || ""} onChange={handleMappingChange("cityField")} />
                    </div>
                    <div className="field">
                      <label>{t("Placement Field")}</label>
                      <input
                        value={mapping.placementField || ""}
                        onChange={handleMappingChange("placementField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Domain Field")}</label>
                      <input
                        value={mapping.domainField || ""}
                        onChange={handleMappingChange("domainField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Campaign Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Campaign Name Field")}</label>
                      <input
                        value={mapping.campaignNameField || ""}
                        onChange={handleMappingChange("campaignNameField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Adset Name Field")}</label>
                      <input
                        value={mapping.adsetNameField || ""}
                        onChange={handleMappingChange("adsetNameField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Ad Name Field")}</label>
                      <input
                        value={mapping.adNameField || ""}
                        onChange={handleMappingChange("adNameField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Performance Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Spend Field")}</label>
                      <input value={mapping.spendField} onChange={handleMappingChange("spendField")} />
                    </div>
                    <div className="field">
                      <label>{t("Revenue Field")}</label>
                      <input value={mapping.revenueField} onChange={handleMappingChange("revenueField")} />
                    </div>
                    <div className="field">
                      <label>{t("FTD Revenue Field")}</label>
                      <input
                        value={mapping.ftdRevenueField || ""}
                        onChange={handleMappingChange("ftdRevenueField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Redeposit Revenue Field")}</label>
                      <input
                        value={mapping.redepositRevenueField || ""}
                        onChange={handleMappingChange("redepositRevenueField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Event Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Clicks Field")}</label>
                      <input value={mapping.clicksField} onChange={handleMappingChange("clicksField")} />
                    </div>
                    <div className="field">
                      <label>{t("Installs Field")}</label>
                      <input value={mapping.installsField} onChange={handleMappingChange("installsField")} />
                    </div>
                    <div className="field">
                      <label>{t("Registers Field")}</label>
                      <input value={mapping.registersField} onChange={handleMappingChange("registersField")} />
                    </div>
                    <div className="field">
                      <label>{t("FTDs Field")}</label>
                      <input value={mapping.ftdsField} onChange={handleMappingChange("ftdsField")} />
                    </div>
                    <div className="field">
                      <label>{t("Redeposits Field")}</label>
                      <input value={mapping.redepositsField} onChange={handleMappingChange("redepositsField")} />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Device Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Device Field")}</label>
                      <input value={mapping.deviceField} onChange={handleMappingChange("deviceField")} />
                    </div>
                    <div className="field">
                      <label>{t("OS Field")}</label>
                      <input value={mapping.osField || ""} onChange={handleMappingChange("osField")} />
                    </div>
                    <div className="field">
                      <label>{t("OS Version Field")}</label>
                      <input
                        value={mapping.osVersionField || ""}
                        onChange={handleMappingChange("osVersionField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("OS Icon Field")}</label>
                      <input value={mapping.osIconField || ""} onChange={handleMappingChange("osIconField")} />
                    </div>
                    <div className="field">
                      <label>{t("Device Model Field")}</label>
                      <input
                        value={mapping.deviceModelField || ""}
                        onChange={handleMappingChange("deviceModelField")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="field-hint">{t("Mapping hidden. Click show to edit fields.")}</p>
            )}
          </div>

          <div className="api-actions">
            {syncState.message && (
              <div className={`api-status ${syncState.ok ? "success" : "error"}`}>
                {syncState.message}
                {syncResult?.inserted !== undefined && (
                  <span className="api-status-meta">
                    {t("Imported {inserted} rows, skipped {skipped} of {total}", {
                      inserted: syncResult.inserted,
                      skipped: syncResult.skipped,
                      total: syncResult.total,
                    })}
                    {syncResult.placementsExtracted !== undefined
                      ? ` · ${t("Placements extracted")}: ${syncResult.placementsExtracted}`
                      : ""}
                    {Array.isArray(syncResult.placementSamples) && syncResult.placementSamples.length
                      ? ` · ${t("Samples")}: ${syncResult.placementSamples.join(", ")}`
                      : ""}
                  </span>
                )}
              </div>
            )}
            <div className="api-actions-group">
              <button
                className="ghost"
                type="button"
                onClick={() => setPayloadText(defaultKeitaroPayloadByTarget[syncTarget] || defaultKeitaroPayload)}
              >
                {t("Load Example")}
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => setPayloadText(defaultKeitaroPayloadByTarget.overall)}
              >
                {t("Load Overall Example")}
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => setPayloadText(defaultKeitaroPayloadByTarget.device)}
              >
                {t("Load Device Example")}
              </button>
            </div>
            <button className="action-pill" type="button" onClick={handleSync} disabled={syncState.loading}>
              {syncState.loading ? t("Syncing...") : t("Sync Now")}
            </button>
          </div>
        </motion.div>
      </section>

      <section className="panels api-stack">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="panel-head">
            <div>
              <h3 className="panel-title">{t("Campaign Mapping")}</h3>
              <p className="panel-subtitle">
                {t("Map Keitaro campaign IDs to media buyers for install attribution.")}
              </p>
            </div>
          </div>

          <form className="form-grid api-grid" onSubmit={handleCampaignSubmit}>
            <div className="field">
              <label>{t("Keitaro Campaign ID")}</label>
              <input value={campaignForm.keitaroId} onChange={updateCampaignForm("keitaroId")} />
            </div>
            <div className="field">
              <label>{t("Campaign Name")}</label>
              <input value={campaignForm.name} onChange={updateCampaignForm("name")} required />
            </div>
            <div className="field">
              <label>{t("Media Buyer")}</label>
              <input value={campaignForm.buyer} onChange={updateCampaignForm("buyer")} required />
            </div>
            <div className="field">
              <label>{t("Country")}</label>
              <select value={campaignForm.country} onChange={updateCampaignForm("country")}>
                <option value="">{t("All Countries")}</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("Domain")}</label>
              <input
                value={campaignForm.domain}
                onChange={updateCampaignForm("domain")}
                placeholder="landing.example.com"
              />
            </div>
            <div className="form-actions">
              <button className="action-pill" type="submit">
                {t("Add Campaign")}
              </button>
            </div>
          </form>

          {campaignState.loading ? (
            <div className="empty-state">{t("Loading campaigns…")}</div>
          ) : campaignState.error ? (
            <div className="empty-state error">{campaignState.error}</div>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">{t("No campaigns added yet.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table campaign-table">
                <thead>
                  <tr>
                    <th>{t("Campaign Name")}</th>
                    <th>{t("Keitaro Campaign ID")}</th>
                    <th>{t("Media Buyer")}</th>
                    <th>{t("Country")}</th>
                    <th>{t("Domain")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>{campaign.name}</td>
                      <td>{campaign.keitaro_id || "—"}</td>
                      <td>{campaign.buyer}</td>
                      <td>{campaign.country || "—"}</td>
                      <td>{campaign.domain || "—"}</td>
                      <td>
                        <button
                          className="icon-btn"
                          type="button"
                          onClick={() => handleCampaignDelete(campaign.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

function LoginScreen({ onLogin, loading, error }) {
  const { t } = useLanguage();
  const savedLogin = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("dash-remember") || "null");
    } catch (err) {
      return null;
    }
  }, []);
  const [form, setForm] = React.useState({
    username: savedLogin?.username || "",
    password: savedLogin?.password || "",
  });
  const [rememberMe, setRememberMe] = React.useState(
    Boolean(savedLogin?.username || savedLogin?.password)
  );
  const [showPassword, setShowPassword] = React.useState(false);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      if (rememberMe) {
        localStorage.setItem(
          "dash-remember",
          JSON.stringify({ username: form.username, password: form.password })
        );
      } else {
        localStorage.removeItem("dash-remember");
      }
    } catch (err) {
      // ignore storage errors
    }
    onLogin(form.username, form.password);
  };

  return (
    <div className="login-screen">
      <div className="login-stack">
        <div className="login-logo">
          <img src={logo} alt="Deus Affiliates" />
        </div>
        <div className="login-card login-card--single">
          <div className="login-right">
            <div className="login-right-header">
              <h3>{t("Sign In")}</h3>
              <span className="login-badge">{t("Secure access")}</span>
            </div>
            <p className="login-sub">{t("Sign in to continue")}</p>
            <form onSubmit={handleSubmit}>
              <div className="field login-field">
                <label>{t("Username")}</label>
                <div className="input-wrap">
                  <User size={16} />
                  <input
                    value={form.username}
                    onChange={handleChange("username")}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>
              <div className="field login-field">
                <label>{t("Password")}</label>
                <div className="input-wrap">
                  <Lock size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange("password")}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    className="icon-btn ghost"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? t("Hide password") : t("Show password")}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                {t("Remember me")}
              </label>
              {error ? <div className="form-error">{error}</div> : null}
              <button className="action-pill" type="submit" disabled={loading}>
                {loading ? t("Logging in...") : t("Sign In")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = React.useState("home");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [rolePermissions, setRolePermissions] = React.useState(null);
  const [authUser, setAuthUser] = React.useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("dash-auth") || "null");
      if (!stored?.token) return null;
      return stored;
    } catch (error) {
      return null;
    }
  });
  const [authState, setAuthState] = React.useState({ loading: false, error: null });
  const [language, setLanguage] = React.useState(() => {
    try {
      return localStorage.getItem("dash-language") || "EN";
    } catch (error) {
      return "EN";
    }
  });
  const [filters, setFilters] = React.useState(() => {
    const range = getDefaultDateRange();
    return {
      dateFrom: range.from,
      dateTo: range.to,
      country: "All",
      city: "All",
      approach: "All",
      buyer: "All",
      category: "All",
      billing: "All",
      status: "All",
    };
  });
  const [period, setPeriod] = React.useState("This Month");
  const [customRange, setCustomRange] = React.useState(() => {
    const range = getDefaultDateRange();
    return { from: range.from, to: range.to };
  });
  const [entry, setEntry] = React.useState({
    date: "2026-02-07",
    country: "Brazil",
    category: "Traffic Source",
    reference: "",
    billing: "Crypto",
    cryptoNetwork: "TRC20",
    cryptoHash: "",
    amount: "",
    status: "Requested",
  });
  const [entries, setEntries] = React.useState([]);
  const [entryState, setEntryState] = React.useState({ loading: true, error: null });

  const isFinances = activeView === "finances";
  const isHome = activeView === "home";
  const isGeos = activeView === "geos";
  const isUtm = activeView === "utm";
  const isStats = activeView === "statistics";
  const isCampaigns = activeView === "campaigns";
  const isPlacements = activeView === "placements";
  const isUserBehavior = activeView === "user_behavior";
  const isApi = activeView === "api";
  const isGoals = activeView === "streams";
  const isDomains = activeView === "domains";
  const isPixels = activeView === "pixels";
  const isRoles = activeView === "roles";
  const isDocs = activeView === "docs";
  const isDevices = activeView === "devices";
  const isProfile = activeView === "profile";
  const isLeadership = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const canManageExpenses = authUser?.role === "Boss" || authUser?.role === "Team Leader";
  const usesPerformanceFilters =
    isHome || isGeos || isStats || isCampaigns || isPlacements || isUserBehavior || isDevices;
  const showFilters = isFinances || usesPerformanceFilters;
  const [viewerBuyer, setViewerBuyer] = React.useState("");
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const range = getPeriodDateRange(period, customRange);
    const normalized = normalizeDateRange(range.from, range.to);
    const nextFrom = normalized.from || "";
    const nextTo = normalized.to || "";
    setFilters((prev) => {
      if (prev.dateFrom === nextFrom && prev.dateTo === nextTo) return prev;
      return {
        ...prev,
        dateFrom: nextFrom,
        dateTo: nextTo,
      };
    });
  }, [period, customRange.from, customRange.to]);

  React.useEffect(() => {
    if (!authUser) return;
    if (isLeadership) {
      setViewerBuyer("");
      return;
    }
    const fallback = authUser?.username || "";
    setViewerBuyer(fallback);
    const fetchBuyer = async () => {
      try {
        const response = await apiFetch("/api/media-buyers?limit=1");
        if (!response.ok) return;
        const data = await response.json();
        const record = Array.isArray(data) ? data[0] : null;
        if (record?.name) {
          setViewerBuyer(record.name);
        }
      } catch (error) {
        // ignore
      }
    };
    fetchBuyer();
  }, [authUser, isLeadership]);

  const effectiveViewerBuyer = viewerBuyer || authUser?.username || "";

  React.useEffect(() => {
    if (!authUser) return;
    if (isLeadership) {
      setFilters((prev) => (prev.buyer === "All" ? prev : { ...prev, buyer: "All" }));
      return;
    }
    if (!effectiveViewerBuyer) return;
    setFilters((prev) =>
      prev.buyer === effectiveViewerBuyer ? prev : { ...prev, buyer: effectiveViewerBuyer }
    );
  }, [authUser, effectiveViewerBuyer, isLeadership]);

  const viewPermissionMap = React.useMemo(
    () => ({
      home: "dashboard",
      geos: "geos",
      streams: "goals",
      finances: "finances",
      utm: "utm",
      statistics: "statistics",
      campaigns: "campaigns",
      placements: "placements",
      user_behavior: "user_behavior",
      devices: "devices",
      domains: "domains",
      pixels: "pixels",
      roles: "roles",
      api: "api",
    }),
    []
  );

  React.useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    const loadPermissions = async () => {
      try {
        const response = await apiFetch("/api/roles?limit=200");
        if (!response.ok) return;
        const data = await response.json();
        const role = data.find((item) => item.name === authUser.role);
        if (!cancelled) {
          setRolePermissions(role?.permissions || []);
        }
      } catch (error) {
        if (!cancelled) {
          setRolePermissions([]);
        }
      }
    };
    loadPermissions();
    return () => {
      cancelled = true;
    };
  }, [authUser]);

  React.useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    const loadFxRate = async () => {
      try {
        const response = await apiFetch("/api/fx");
        if (!response.ok) return;
        const data = await response.json();
        const rate = Number(data?.rate);
        if (!cancelled && Number.isFinite(rate) && rate > 0) {
          setActiveFxRate(rate);
        }
      } catch (error) {
        if (!cancelled) {
          setActiveFxRate(1);
        }
      }
    };
    loadFxRate();
    return () => {
      cancelled = true;
    };
  }, [authUser]);

  const allowedPermissions = React.useMemo(() => {
    const basePermissions = rolePermissions?.length
      ? rolePermissions
      : permissionOptions.map((perm) => perm.key);
    const list = Array.isArray(basePermissions) ? [...basePermissions] : [];
    if (list.includes("statistics") && !list.includes("placements")) {
      list.push("placements");
    }
    if (list.includes("statistics") && !list.includes("campaigns")) {
      list.push("campaigns");
    }
    if (list.includes("statistics") && !list.includes("user_behavior")) {
      list.push("user_behavior");
    }
    return Array.from(new Set(list));
  }, [rolePermissions]);

  const allowedNavItems = navItems.filter((item) => {
    const perm = viewPermissionMap[item.key];
    if (!perm) return true;
    return allowedPermissions.includes(perm);
  });
  const navItemMap = React.useMemo(
    () => Object.fromEntries(navItems.map((item) => [item.key, item])),
    []
  );
  const navSectionsToRender = React.useMemo(() => {
    const allowedKeys = new Set(allowedNavItems.map((item) => item.key));
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((key) => allowedKeys.has(key)),
      }))
      .filter((section) => section.items.length > 0);
  }, [allowedNavItems]);

  React.useEffect(() => {
    if (!authUser) return;
    const allowedViews = allowedNavItems.map((item) => item.key).concat(["profile", "docs"]);
    if (allowedViews.length && !allowedViews.includes(activeView)) {
      setActiveView(allowedViews[0]);
    }
  }, [allowedNavItems, activeView, authUser]);

  const t = React.useCallback(
    (key, vars) => {
      let text = language === "TR" ? translations.tr?.[key] ?? key : key;
      if (vars) {
        Object.entries(vars).forEach(([name, value]) => {
          text = text.replaceAll(`{${name}}`, String(value));
        });
      }
      return text;
    },
    [language]
  );

  React.useEffect(() => {
    try {
      localStorage.setItem("dash-language", language);
    } catch (error) {
      // ignore storage issues
    }
  }, [language]);

  React.useEffect(() => {
    try {
      if (authUser) {
        localStorage.setItem("dash-auth", JSON.stringify(authUser));
      } else {
        localStorage.removeItem("dash-auth");
      }
    } catch (error) {
      // ignore storage issues
    }
  }, [authUser]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleInvalid = () => {
      setAuthUser(null);
      setAuthState({ loading: false, error: t("Session expired. Please sign in again.") });
    };
    window.addEventListener("auth:invalid", handleInvalid);
    return () => window.removeEventListener("auth:invalid", handleInvalid);
  }, [t]);

  React.useEffect(() => {
    if (authUser && !authUser.token) {
      setAuthUser(null);
    }
  }, [authUser]);

  const handleLogin = async (username, password) => {
    setAuthState({ loading: true, error: null });
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Invalid credentials.");
      }
      const nextAuth = { ...data.user, token: data.token };
      try {
        localStorage.setItem("dash-auth", JSON.stringify(nextAuth));
      } catch (error) {
        // ignore storage issues
      }
      setAuthUser(nextAuth);
      setAuthState({ loading: false, error: null });
    } catch (error) {
      const message = error.message || "Invalid credentials.";
      setAuthState({ loading: false, error: t(message) });
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("dash-auth");
    } catch (error) {
      // ignore storage issues
    }
    setAuthUser(null);
  };

  React.useEffect(() => {
    if (!filtersOpen) return;
    const handleKey = (event) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  React.useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClick = (event) => {
      if (!event.target.closest(".profile-menu-wrap")) {
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [profileMenuOpen]);

  const updateFilter = (key) => (event) => {
    const value = event.target.value;
    setFilters((prev) => {
      if (key === "dateFrom" || key === "dateTo") {
        const next = { ...prev, [key]: value };
        const normalized = normalizeDateRange(next.dateFrom, next.dateTo);
        return {
          ...next,
          dateFrom: normalized.from || "",
          dateTo: normalized.to || "",
        };
      }
      return { ...prev, [key]: value };
    });
    if (key === "dateFrom" || key === "dateTo") {
      setCustomRange((prev) => {
        const nextRange = {
          ...prev,
          [key === "dateFrom" ? "from" : "to"]: value,
        };
        return normalizeDateRange(nextRange.from, nextRange.to);
      });
      setPeriod("Custom range");
    }
  };

  const handleCustomRange = (key, value) => {
    setCustomRange((prev) => {
      const nextRange = { ...prev, [key]: value };
      return normalizeDateRange(nextRange.from, nextRange.to);
    });
  };

  const handleEntryChange = (key) => (event) => {
    setEntry((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetEntry = () => {
    setEntry({
      date: "2026-02-07",
      country: "Brazil",
      category: "Traffic Source",
      reference: "",
      billing: "Crypto",
      cryptoNetwork: "TRC20",
      cryptoHash: "",
      amount: "",
      status: "Requested",
    });
  };

  const fetchEntries = React.useCallback(async () => {
    try {
      setEntryState({ loading: true, error: null });
      const response = await apiFetch("/api/expenses?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load expenses.");
      }
      const data = await response.json();
      setEntries(data);
      setEntryState({ loading: false, error: null });
    } catch (error) {
      setEntryState({ loading: false, error: error.message || "Failed to load expenses." });
    }
  }, []);

  React.useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleEntrySubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        throw new Error("Failed to save entry.");
      }
      await fetchEntries();
      resetEntry();
    } catch (error) {
      setEntryState({ loading: false, error: error.message || "Failed to save entry." });
    }
  };

  const handleEntryStatusChange = async (id, status) => {
    if (!id) return;
    try {
      const response = await apiFetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update status.");
      }
      await fetchEntries();
    } catch (error) {
      setEntryState((prev) => ({
        ...prev,
        error: error.message || "Failed to update status.",
      }));
    }
  };

  const handleEntryDelete = async (id) => {
    if (!id) return;
    const confirmed = window.confirm("Remove this payment? This cannot be undone.");
    if (!confirmed) return;
    try {
      const response = await apiFetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to remove payment.");
      }
      await fetchEntries();
    } catch (error) {
      setEntryState((prev) => ({
        ...prev,
        error: error.message || "Failed to remove payment.",
      }));
    }
  };

  if (!authUser) {
    return (
      <LanguageContext.Provider value={{ language, t }}>
        <LoginScreen onLogin={handleLogin} loading={authState.loading} error={authState.error} />
      </LanguageContext.Provider>
    );
  }

  const profileName = authUser?.username || "DeusInsta";
  const profileRole = authUser?.role || "Media Buyer";
  const profileInitials = profileName.slice(0, 2).toUpperCase();

  return (
    <LanguageContext.Provider value={{ language, t }}>
      <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src={logo} alt="Deus Affiliates" />
        </div>

        <div className="sidebar-section">
          <p className="section-title">{t("Logged as {role}", { role: t(profileRole) })}</p>
          <button className="team-pill" type="button">
            <span className="team-pill-icon" aria-hidden="true">
              <Trophy size={14} />
            </span>
            <span className="team-pill-content">
              <span className="team-pill-name">{profileName}</span>
            </span>
          </button>
        </div>

        <nav className="nav">
          {navSectionsToRender.map((section) => (
            <div className="nav-group" key={section.title}>
              <div className="nav-section-title">{t(section.title)}</div>
              {section.items.map((key) => {
                const item = navItemMap[key];
                if (!item) return null;
                const Icon = item.icon;
                const isActive =
                  !item.href && (activeView === item.key || (activeView === "home" && item.key === "home"));
                const isExternal = Boolean(item.href);
                return (
                  <a
                    key={item.label}
                    className={`nav-item${isActive ? " active" : ""}`}
                    href={item.href || "#"}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                    onClick={(event) => {
                      if (isExternal) return;
                      event.preventDefault();
                      setActiveView(item.key);
                    }}
                  >
                    <Icon size={18} />
                    {t(item.label)}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className={`action-pill sidebar-docs${isDocs ? " is-active" : ""}`}
            type="button"
            onClick={() => setActiveView("docs")}
          >
            <BookOpen size={16} />
            {t("Documentation")}
          </button>
          <div className="language-switch">
            <div className="language-chip">
              {(() => {
                const current = languageOptions.find((item) => item.code === language) || languageOptions[0];
                const Flag = current.Flag;
                return <span className="flag">{Flag ? <Flag /> : current.code}</span>;
              })()}
              <span>{language}</span>
            </div>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.code} · {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          {showFilters ? (
            <button className="action-pill" type="button" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={18} />
              {t("Filters")}
            </button>
          ) : (
            <div />
          )}

          <div className="topbar-actions">
            <div className="profile-menu-wrap">
              <button
                className={`profile profile-clickable${isProfile ? " is-active" : ""}`}
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
              >
                <span className="avatar">{profileInitials}</span>
                <div>
                  <div className="profile-role">{t(profileRole)}</div>
                  <div className="profile-name">{profileName}</div>
                </div>
              </button>
              {profileMenuOpen ? (
                <div className="profile-menu">
                  <button
                    className="profile-menu-item"
                    type="button"
                    onClick={() => {
                      setActiveView("profile");
                      setProfileMenuOpen(false);
                    }}
                  >
                    {t("Profile")}
                  </button>
                  <button
                    className="profile-menu-item"
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    {t("Logout")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {isFinances ? (
          <FinancesDashboard
            entry={entry}
            entries={entries}
            entryState={entryState}
            onEntryChange={handleEntryChange}
            onEntrySubmit={handleEntrySubmit}
            onEntryReset={resetEntry}
            onEntryStatusChange={handleEntryStatusChange}
            onEntryDelete={handleEntryDelete}
            canManageExpenses={canManageExpenses}
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
          />
        ) : isUtm ? (
          <UtmBuilder />
        ) : isGoals ? (
          <GoalsDashboard authUser={authUser} />
        ) : isDomains ? (
          <DomainsDashboard authUser={authUser} />
        ) : isPixels ? (
          <PixelsDashboard authUser={authUser} />
        ) : isProfile ? (
          <ProfileDashboard authUser={authUser} />
        ) : isRoles ? (
          <RolesDashboard authUser={authUser} />
        ) : isGeos ? (
          <GeosDashboard
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isApi ? (
          <KeitaroApiView />
        ) : isStats ? (
          <StatisticsDashboard
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
            filters={filters}
          />
        ) : isCampaigns ? (
          <CampaignsDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isPlacements ? (
          <PlacementsDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isUserBehavior ? (
          <UserBehaviorDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isDevices ? (
          <DevicesDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        ) : isDocs ? (
          <DocumentationDashboard />
        ) : (
          <HomeDashboard
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            onCustomChange={handleCustomRange}
            filters={filters}
            onSeeGeos={() => setActiveView("geos")}
            authUser={authUser}
            viewerBuyer={effectiveViewerBuyer}
          />
        )}
      </main>

      <AnimatePresence>
        {filtersOpen && showFilters && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="filters-title"
            >
              <div className="modal-head">
                <div>
                  <p className="modal-kicker">
                    {isFinances ? "Finance Filters" : isGeos ? "GEO Filters" : "Dashboard Filters"}
                  </p>
                  <h2 id="filters-title">
                    {isFinances ? "Refine expenses" : isGeos ? "Refine geos" : "Refine performance"}
                  </h2>
                </div>
                <button className="icon-btn" type="button" onClick={() => setFiltersOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div className="field">
                  <label>Date</label>
                  <div className="field-row">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={updateFilter("dateFrom")}
                    />
                    <span className="field-sep">to</span>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={updateFilter("dateTo")}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Country</label>
                  <select value={filters.country} onChange={updateFilter("country")}>
                    <option>All</option>
                    {countryOptions.map((country) => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {usesPerformanceFilters ? (
                  <>
                    {isGeos ? (
                      <div className="field">
                        <label>Region / State</label>
                        <input
                          type="text"
                          placeholder="All"
                          value={filters.city}
                          onChange={updateFilter("city")}
                        />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="field">
                      <label>Category</label>
                      <select value={filters.category} onChange={updateFilter("category")}>
                        <option>All</option>
                        {categoryOptions.map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Billing type</label>
                      <select value={filters.billing} onChange={updateFilter("billing")}>
                        <option>All</option>
                        {billingOptions.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Status</label>
                      <select value={filters.status} onChange={updateFilter("status")}>
                        <option>All</option>
                        {statusOptions.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="ghost"
                  type="button"
                  onClick={() => {
                    const defaultRange = getDefaultDateRange();
                    setFilters({
                      dateFrom: defaultRange.from,
                      dateTo: defaultRange.to,
                      country: "All",
                      city: "All",
                      approach: "All",
                      buyer: isLeadership ? "All" : effectiveViewerBuyer,
                      category: "All",
                      billing: "All",
                      status: "All",
                    });
                    setCustomRange(defaultRange);
                    setPeriod("Custom range");
                  }}
                >
                  Reset
                </button>
                <button className="action-pill" type="button" onClick={() => setFiltersOpen(false)}>
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </LanguageContext.Provider>
  );
}
