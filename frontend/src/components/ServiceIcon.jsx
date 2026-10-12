import React from 'react';
import {
  WrenchIcon, ZapIcon, DropletIcon, BrushIcon, WindIcon, ShieldIcon,
  PackageIcon, CleaningIcon, AcIcon, LockIcon, BugIcon, LeafIcon,
} from './Icons';

const SVC_ICONS = {
  default: WrenchIcon,
  clean: CleaningIcon, cleaning: CleaningIcon,
  electric: ZapIcon, electrical: ZapIcon,
  plumb: DropletIcon, plumbing: DropletIcon,
  paint: BrushIcon, painting: BrushIcon,
  pest: BugIcon,
  ac: AcIcon, air: WindIcon,
  carpentr: PackageIcon, wood: PackageIcon,
  repair: WrenchIcon,
  security: LockIcon, cctv: ShieldIcon,
  garden: LeafIcon,
  move: PackageIcon,
};

export function getServiceIconComp(name = '') {
  const n = (name || '').toLowerCase();
  for (const [key, Comp] of Object.entries(SVC_ICONS)) {
    if (n.includes(key)) return Comp;
  }
  return SVC_ICONS.default;
}

export function ServiceIcon({ name, size = 20, color = 'currentColor', strokeWidth }) {
  const Comp = getServiceIconComp(name);
  return <Comp size={size} color={color} strokeWidth={strokeWidth} />;
}
