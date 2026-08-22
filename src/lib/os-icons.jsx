export const AndroidIcon = ({ size = 18, className, style }) => (
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

export const AppleIcon = ({ size = 18, className, style }) => (
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

export const WindowsIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="8" height="8" fill="currentColor" />
    <rect x="13" y="3" width="8" height="8" fill="currentColor" />
    <rect x="3" y="13" width="8" height="8" fill="currentColor" />
    <rect x="13" y="13" width="8" height="8" fill="currentColor" />
  </svg>
);

export const LinuxIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <rect x="7" y="12" width="10" height="8" rx="4" fill="currentColor" />
    <circle cx="10" cy="7.5" r="0.8" fill="#0b0f0c" />
    <circle cx="14" cy="7.5" r="0.8" fill="#0b0f0c" />
  </svg>
);

export const ChromeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

export const DesktopIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="2" fill="currentColor" />
    <rect x="9" y="18" width="6" height="2" fill="currentColor" />
  </svg>
);

export const MobileIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="7" y="3" width="10" height="18" rx="2" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="#0b0f0c" />
  </svg>
);

export const TabletIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="3" width="14" height="18" rx="2" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="#0b0f0c" />
  </svg>
);

export const UnknownIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="currentColor" />
    <path
      d="M12 7c-1.6 0-2.6.9-2.6 2.2h1.8c.1-.5.4-.8.9-.8.6 0 1 .4 1 1 0 .7-.6 1-1.3 1.4-.8.4-1.3.9-1.3 2v.4h1.8v-.3c0-.6.4-.8 1-.9.8-.2 1.8-.7 1.8-2.4 0-1.7-1.3-2.6-3.1-2.6zm-.9 8.5c0 .6.5 1.1 1.1 1.1s1.1-.5 1.1-1.1-.5-1.1-1.1-1.1-1.1.5-1.1 1.1z"
      fill="#0b0f0c"
    />
  </svg>
);

export const getOsIconComponent = (value) => {
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

export const getOsAccent = (value) => {
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
