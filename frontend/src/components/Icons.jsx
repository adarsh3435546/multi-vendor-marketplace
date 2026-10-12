import React from 'react';

// Stroke-based professional SVG icon set (Heroicons / Lucide style)
// All icons are 24x24 viewBox, stroke-based, customisable via size/color/strokeWidth

const defaultProps = {
  size: 20,
  color: 'currentColor',
  strokeWidth: 1.8,
};

function Icon({ size, color, strokeWidth, children, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ── Navigation ── */
export function HomeIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </Icon>
  );
}

export function GridIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Icon>
  );
}

export function InfoIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </Icon>
  );
}

export function UserIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  );
}

export function ChevronDownIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <polyline points="6 9 12 15 18 9" />
    </Icon>
  );
}

export function LogOutIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Icon>
  );
}

export function MenuIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </Icon>
  );
}

export function XIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Icon>
  );
}

/* ── Services / Features ── */
export function ZapIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Icon>
  );
}

export function WrenchIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </Icon>
  );
}

export function BrushIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.48 1.02 3.5 1.02 2.22 0 3.5-1.51 3.5-3.07 0-1.67-1.33-2.99-2-3z" />
    </Icon>
  );
}

export function DropletIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </Icon>
  );
}

export function WindIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </Icon>
  );
}

export function ShieldIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Icon>
  );
}

export function ShieldCheckIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </Icon>
  );
}

export function LockIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  );
}

export function KeyIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </Icon>
  );
}

/* ── Finance / Payment ── */
export function CreditCardIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </Icon>
  );
}

export function IndianRupeeIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="m6 13 8.5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c6.667 0 6.667-10 0-10" />
    </Icon>
  );
}

export function TrendingUpIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </Icon>
  );
}

/* ── Bookings / Calendar ── */
export function CalendarIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Icon>
  );
}

export function ClockIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Icon>
  );
}

export function InboxIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </Icon>
  );
}

export function CheckCircleIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </Icon>
  );
}

export function XCircleIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </Icon>
  );
}

/* ── Admin ── */
export function UsersIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

export function StoreIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
    </Icon>
  );
}

export function BarChart2Icon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </Icon>
  );
}

export function SettingsIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Icon>
  );
}

export function AlertTriangleIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  );
}

export function SearchIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Icon>
  );
}

export function PlusIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Icon>
  );
}

export function EditIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Icon>
  );
}

export function TrashIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </Icon>
  );
}

export function RefreshIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </Icon>
  );
}

export function ArrowRightIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Icon>
  );
}

export function StarIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Icon>
  );
}

export function MapPinIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </Icon>
  );
}

export function PhoneIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.97-1.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </Icon>
  );
}

export function MailIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </Icon>
  );
}

export function PackageIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </Icon>
  );
}

export function EyeIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </Icon>
  );
}

export function ToggleLeftIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="8" cy="12" r="3" />
    </Icon>
  );
}

export function ToggleRightIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="16" cy="12" r="3" />
    </Icon>
  );
}

// Service-specific icons
export function CleaningIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M3 22l4-4" />
      <path d="M7.5 13.5 11 10" />
      <path d="M11 6a3 3 0 0 1 3 3" />
      <path d="m14 9 7.5-7.5" />
      <path d="m21.5 1.5-1 1" />
      <path d="M14 14v1" />
      <path d="M14 19v1" />
      <path d="M10 17h1" />
      <path d="M19 17h1" />
      <path d="M12 22a5 5 0 0 0 5-5H7a5 5 0 0 0 5 5z" />
    </Icon>
  );
}

export function AcIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M8 16a4 4 0 0 0 8 0" />
      <path d="M8 16H3" />
      <path d="M16 16h5" />
      <rect x="2" y="3" width="20" height="8" rx="2" />
      <path d="M6 11v5" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
      <path d="M18 11v5" />
    </Icon>
  );
}

export function BugIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <rect x="8" y="6" width="8" height="14" rx="4" />
      <path d="M12 6V3" />
      <path d="M8 10H3" />
      <path d="M21 10h-5" />
      <path d="M8 16H4" />
      <path d="M20 16h-4" />
      <path d="m6 3 2 3" />
      <path d="m18 3-2 3" />
    </Icon>
  );
}

export function LeafIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </Icon>
  );
}

export function ClipboardListIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </Icon>
  );
}

export function TagIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </Icon>
  );
}

export function BadgeCheckIcon(p) {
  const { size, color, strokeWidth } = { ...defaultProps, ...p };
  return (
    <Icon size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}
