import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookmarkIcon, HeartIcon } from 'lucide-react';
import { actors } from '../data/actors';
import { getTitle } from '../data/titles';
import type { Title } from '../data/titles';
import { ActorCard } from '../components/ActorCard';
import { useFavorites } from '../contexts/FavoritesContext';

const tabs = [
{ id: 'stars', label: 'Stars' },
{ id: 'titles', label: 'Shows & Movies' }] as
const;

type TabId = (typeof tabs)[number]['id'];

export function Favorites() {
  const [tab, setTab] = useState<TabId>('stars');
  const { actorIds, titleIds, toggleTitle } = useFavorites();

  const savedActors = actors.filter((a) => actorIds.includes(a.id));
  const titles = titleIds.map(getTitle).filter((t): t is Title => Boolean(t));

  return (
    <div className="pb-6">
      <header className="rounded-b-3xl bg-maroon-deep px-5 pb-4 pt-12">
        <h1 className="font-display text-[24px] font-black tracking-tight text-cream">My favorites</h1>
        <p className="mt-1 text-[13px] text-cream-400">
          {savedActors.length} stars · {titles.length} titles saved
        </p>

        <div role="tablist" aria-label="Favorites" className="mt-4 flex gap-1 rounded-2xl bg-white/10 p-1">
          {tabs.map((t) =>
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className="relative flex-1 rounded-xl2 px-3 py-2.5 text-[13.5px] font-bold outline-none transition-colors duration-150 ease-smooth focus-visible:ring-2 focus-visible:ring-gold">
            
              {tab === t.id &&
            <motion.span
              layoutId="fav-tab"
              transition={{ type: 'spring', stiffness: 520, damping: 40 }}
              className="absolute inset-0 rounded-xl2 bg-cream"
              aria-hidden="true" />

            }
              <span className={`relative ${tab === t.id ? 'text-maroon-deep' : 'text-cream-300'}`}>
                {t.label}
              </span>
            </button>
          )}
        </div>
      </header>

      {tab === 'stars' ?
      savedActors.length ?
      <div className="grid grid-cols-2 gap-3 px-5 pt-5">
            {savedActors.map((actor) =>
        <ActorCard key={actor.id} actor={actor} />
        )}
          </div> :

      <EmptyState
        Icon={HeartIcon}
        title="No stars saved yet"
        body="Tap the heart on any profile to keep your favorites here."
        cta="Browse stars" /> :


      titles.length ?
      <ul className="space-y-2.5 px-5 pt-5">
          {titles.map((title) =>
        <li key={title.id} className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-card">
              <img
            src={title.poster}
            alt=""
            loading="lazy"
            className="h-[78px] w-[58px] shrink-0 rounded-2xl object-cover" />
          
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[15.5px] font-bold text-ink">{title.title}</p>
                <p className="mt-0.5 text-[12.5px] text-maroon-deep/70">
                  {title.type} · {title.year}
                </p>
                <p className="mt-1.5 inline-block rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-maroon">
                  {title.note ?? 'Watchlist'}
                </p>
              </div>
              <button
            type="button"
            onClick={() => toggleTitle(title.id)}
            aria-label={`Remove ${title.title} from watchlist`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream-200 outline-none transition-colors duration-150 ease-smooth hover:bg-cream-300 focus-visible:ring-2 focus-visible:ring-maroon">
            
                <BookmarkIcon className="h-[17px] w-[17px] fill-maroon text-maroon" aria-hidden="true" />
              </button>
            </li>
        )}
        </ul> :

      <EmptyState
        Icon={BookmarkIcon}
        title="Your watchlist is empty"
        body="Save teleseryes and movies from any filmography to track them here."
        cta="Find something to watch" />

      }
    </div>);

}

function EmptyState({
  Icon,
  title,
  body,
  cta





}: {Icon: typeof HeartIcon;title: string;body: string;cta: string;}) {
  return (
    <div className="mx-5 mt-6 rounded-4xl bg-white px-7 py-12 text-center shadow-card">
      <Icon className="mx-auto h-9 w-9 text-cream-400" aria-hidden="true" />
      <h2 className="mt-3 font-display text-[17px] font-extrabold text-ink">{title}</h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-maroon-deep/70">{body}</p>
      <Link
        to="/search"
        className="mt-5 inline-block rounded-full bg-maroon px-5 py-2.5 text-[13.5px] font-bold text-cream outline-none transition-colors duration-150 ease-smooth hover:bg-maroon-light focus-visible:ring-2 focus-visible:ring-gold">
        
        {cta}
      </Link>
    </div>);

}