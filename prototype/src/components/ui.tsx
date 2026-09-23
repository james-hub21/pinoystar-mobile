import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HeartIcon } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';

export function SectionHeading({
  title,
  action,
  to




}: {title: string;action?: string;to?: string;}) {
  return (
    <div className="mb-3 flex items-baseline justify-between px-5">
      <h2 className="font-display text-[19px] font-extrabold tracking-tight text-ink">{title}</h2>
      {action && to &&
      <Link
        to={to}
        className="flex items-center gap-0.5 rounded-lg text-[13px] font-semibold text-maroon outline-none transition-colors duration-150 ease-smooth hover:text-maroon-light focus-visible:ring-2 focus-visible:ring-maroon">
        
          {action}
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
    </div>);

}

export function Chip({
  label,
  selected,
  onClick,
  tone = 'light'





}: {label: string;selected?: boolean;onClick?: () => void;tone?: 'light' | 'dark';}) {
  const base =
  'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold outline-none transition-colors duration-150 ease-smooth focus-visible:ring-2 focus-visible:ring-gold';
  const styles = selected ?
  'bg-maroon text-cream' :
  tone === 'dark' ?
  'bg-white/10 text-cream-200 hover:bg-white/20' :
  'bg-cream-200 text-maroon-deep hover:bg-cream-300';
  return (
    <button type="button" onClick={onClick} aria-pressed={!!onClick && !!selected} className={`${base} ${styles}`}>
      {label}
    </button>);

}

export function FavoriteButton({
  actorId,
  name,
  size = 'md'




}: {actorId: string;name: string;size?: 'sm' | 'md';}) {
  const { isFavoriteActor, toggleActor } = useFavorites();
  const active = isFavoriteActor(actorId);
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]';
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleActor(actorId);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      className={`${dim} grid place-items-center rounded-full bg-ink/60 backdrop-blur-sm outline-none transition-transform duration-150 ease-smooth hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold`}>
      
      <HeartIcon
        className={`${icon} transition-colors duration-150 ease-smooth ${
        active ? 'fill-pinoy-red text-pinoy-red' : 'text-cream'}`
        }
        strokeWidth={2}
        aria-hidden="true" />
      
    </button>);

}

export function Rail({ children, className = '' }: {children: React.ReactNode;className?: string;}) {
  return (
    <div className={`no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 ${className}`}>
      {children}
    </div>);

}