import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BellIcon, PlayIcon, StarIcon } from 'lucide-react';
import { actors, spotlightIds, trendingIds } from '../data/actors';
import { news } from '../data/news';
import type { Actor } from '../types';
import { Chip, FavoriteButton, Rail, SectionHeading } from '../components/ui';

const categories = ['Movies', 'Teleserye', 'New Generation', 'Legends'] as const;

type Category = (typeof categories)[number];

const byId = (id: string) => actors.find((a) => a.id === id)!;

const matchesCategory = (actor: Actor, category: Category): boolean => {
  switch (category) {
    case 'Movies':
      return actor.credits.some((c) => c.type === 'Movie');
    case 'Teleserye':
      return actor.credits.some((c) => c.type === 'Teleserye' || c.type === 'Series');
    case 'New Generation':
      return actor.generation === 'Gen Z';
    case 'Legends':
      return actor.generation === 'Legends';
  }
};

export function Home() {
  const [category, setCategory] = useState<Category>('Movies');
  const spotlight = spotlightIds.map(byId);
  const [lead, ...rest] = news;

  const trending = useMemo(() => {
    const ranked = trendingIds.map(byId).filter((a) => matchesCategory(a, category));
    const extras = actors.filter(
      (a) => matchesCategory(a, category) && !ranked.some((r) => r.id === a.id)
    );
    return [...ranked, ...extras];
  }, [category]);

  return (
    <div className="pb-6">
      <header className="rounded-b-4xl bg-maroon-deep px-5 pb-16 pt-12 text-cream">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold">
              Magandang gabi
            </p>
            <h1 className="mt-1 font-display text-[30px] font-black leading-none tracking-tight">
              Pino<span className="text-gold">y</span>Stars
            </h1>
          </div>
          <Link
            to="/profile"
            aria-label="Notifications and settings"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-white/10 outline-none transition-colors duration-150 ease-smooth hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-gold">
            
            <BellIcon className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-pinoy-yellow" />
          </Link>
        </div>

        <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5">
          {categories.map((c) =>
          <Chip
            key={c}
            label={c}
            tone="dark"
            selected={category === c}
            onClick={() => setCategory(c)} />

          )}
        </div>
      </header>

      {/* Spotlight — the reason people open the app, so it gets the most surface */}
      <section aria-labelledby="spotlight-heading" className="-mt-10">
        <h2 id="spotlight-heading" className="sr-only">
          Featured spotlight
        </h2>
        <Rail>
          {spotlight.map((actor, i) =>
          <motion.article
            key={actor.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-[290px] shrink-0 snap-start overflow-hidden rounded-4xl bg-maroon shadow-lift">
            
              <Link to={`/actor/${actor.id}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-gold">
                <div className="aspect-[4/5] w-full">
                  <img src={actor.photo} alt={actor.name} className="h-full w-full object-cover object-top" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-ink/80 px-4 py-3.5 backdrop-blur-md">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                    Spotlight
                  </p>
                  <h3 className="mt-1 font-display text-[22px] font-extrabold leading-tight text-cream">
                    {actor.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-cream-300">
                    {actor.tagline}
                  </p>
                </div>
              </Link>
              <div className="absolute right-3 top-3">
                <FavoriteButton actorId={actor.id} name={actor.name} />
              </div>
            </motion.article>
          )}
        </Rail>
      </section>

      <section aria-labelledby="trending-heading" className="mt-8">
        <div id="trending-heading">
          <SectionHeading
            title={`Trending in ${category}`}
            action="See all"
            to="/search" />
          
        </div>
        <Rail>
          {trending.map((actor, i) =>
          <Link
            key={actor.id}
            to={`/actor/${actor.id}`}
            className="w-[118px] shrink-0 snap-start outline-none focus-visible:ring-2 focus-visible:ring-maroon">
            
              <div className="relative overflow-hidden rounded-3xl shadow-card">
                <div className="aspect-[3/4] w-full">
                  <img
                  src={actor.photo}
                  alt={actor.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-top" />
                
                </div>
                <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-gold font-display text-[13px] font-black text-maroon-deep">
                  {i + 1}
                </span>
              </div>
              <p className="mt-2 truncate font-display text-[13.5px] font-bold text-ink">{actor.name}</p>
              <p className="flex items-center gap-1 text-[11.5px] font-medium text-maroon-soft">
                <StarIcon className="h-3 w-3 fill-gold text-gold" aria-hidden="true" />
                {actor.followers} fans
              </p>
            </Link>
          )}
        </Rail>
      </section>

      <section aria-labelledby="news-heading" className="mt-8">
        <div id="news-heading">
          <SectionHeading title="Latest showbiz" />
        </div>

        <article className="mx-5 overflow-hidden rounded-3xl bg-white shadow-card">
          <div className="aspect-[16/9] w-full">
            <img src={lead.image} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="rounded-full bg-pinoy-red px-2.5 py-1 text-cream">{lead.tag}</span>
              <span className="text-maroon-soft">{lead.publishedAgo}</span>
            </div>
            <h3 className="mt-2.5 font-display text-[18px] font-extrabold leading-snug text-ink">
              {lead.headline}
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-maroon-deep/70">{lead.excerpt}</p>
            <p className="mt-3 text-[12px] font-semibold text-maroon">
              {lead.source} · {lead.minutesRead} min read
            </p>
          </div>
        </article>

        <ul className="mt-3 divide-y divide-cream-300 px-5">
          {rest.map((item) =>
          <li key={item.id}>
              <button
              type="button"
              className="flex w-full items-center gap-3 py-3.5 text-left outline-none transition-opacity duration-150 ease-smooth hover:opacity-80 focus-visible:ring-2 focus-visible:ring-maroon">
              
                <img
                src={item.image}
                alt=""
                loading="lazy"
                className="h-[62px] w-[62px] shrink-0 rounded-2xl object-cover object-top" />
              
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[14.5px] font-bold leading-snug text-ink line-clamp-2">
                    {item.headline}
                  </span>
                  <span className="mt-1 block text-[11.5px] font-medium text-maroon-soft">
                    {item.source} · {item.publishedAgo}
                  </span>
                </span>
              </button>
            </li>
          )}
        </ul>
      </section>

      <section className="mx-5 mt-6 flex items-center gap-3 rounded-3xl bg-maroon p-4 text-cream">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold text-maroon-deep">
          <PlayIcon className="h-5 w-5 fill-current" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] font-bold">Guess the Actor</span>
          <span className="block text-[12.5px] text-cream-300">6 new rounds dropped today</span>
        </span>
        <Link
          to="/trivia"
          className="shrink-0 rounded-full bg-cream px-4 py-2 text-[13px] font-bold text-maroon-deep outline-none transition-colors duration-150 ease-smooth hover:bg-gold-pale focus-visible:ring-2 focus-visible:ring-gold">
          
          Play
        </Link>
      </section>
    </div>);

}