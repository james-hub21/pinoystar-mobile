import React from 'react';
import { Link } from 'react-router-dom';
import type { Actor } from '../types';
import { FavoriteButton } from './ui';

interface Props {
  actor: Actor;
  /** grid = square-ish tile in a 2-col grid, rail = fixed-width card in a horizontal rail */
  variant?: 'grid' | 'rail';
  showFavorite?: boolean;
}

export function ActorCard({ actor, variant = 'grid', showFavorite = true }: Props) {
  const width = variant === 'rail' ? 'w-[132px] shrink-0 snap-start' : 'w-full';
  return (
    <Link
      to={`/actor/${actor.id}`}
      className={`${width} group relative block overflow-hidden rounded-3xl bg-maroon-deep shadow-card outline-none transition-transform duration-200 ease-smooth hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-maroon`}>
      
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img
          src={actor.photo}
          alt={actor.name}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-300 ease-smooth group-hover:scale-[1.03]" />
        
      </div>
      {showFavorite &&
      <div className="absolute right-2 top-2">
          <FavoriteButton actorId={actor.id} name={actor.name} size="sm" />
        </div>
      }
      <div className="absolute inset-x-0 bottom-0 bg-ink/75 px-3 py-2.5 backdrop-blur-md">
        <p className="truncate font-display text-[14px] font-bold leading-tight text-cream">
          {actor.name}
        </p>
        <p className="truncate text-[11px] font-medium text-gold-light">
          {actor.network} · {actor.generation}
        </p>
      </div>
    </Link>);

}