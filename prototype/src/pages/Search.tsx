import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { actors } from '../data/actors';
import { ActorCard } from '../components/ActorCard';
import { Chip } from '../components/ui';

type FilterKey = 'decade' | 'genre' | 'network' | 'gender' | 'generation';

const filterGroups: {key: FilterKey;label: string;options: string[];}[] = [
{ key: 'decade', label: 'Decade', options: ['1980s', '1990s', '2000s', '2010s', '2020s'] },
{ key: 'genre', label: 'Genre', options: ['Drama', 'Romance', 'Comedy', 'Action', 'Fantasy', 'Period'] },
{ key: 'network', label: 'Network', options: ['ABS-CBN', 'GMA', 'Viva', 'TV5', 'Independent'] },
{ key: 'gender', label: 'Gender', options: ['Female', 'Male'] },
{ key: 'generation', label: 'Generation', options: ['Legends', 'Millennial', 'Gen Z'] }];


const quickFilters = ['Legends', 'Gen Z', 'ABS-CBN', 'GMA', 'Drama', '1990s'];

type Filters = Record<FilterKey, string[]>;

const emptyFilters: Filters = { decade: [], genre: [], network: [], gender: [], generation: [] };

export function Search() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeCount = Object.values(filters).reduce((n, v) => n + v.length, 0);

  const toggle = (key: FilterKey, option: string) =>
  setFilters((prev) => ({
    ...prev,
    [key]: prev[key].includes(option) ? prev[key].filter((o) => o !== option) : [...prev[key], option]
  }));

  const toggleQuick = (value: string) => {
    const group = filterGroups.find((g) => g.options.includes(value));
    if (group) toggle(group.key, value);
  };

  const isQuickActive = (value: string) => {
    const group = filterGroups.find((g) => g.options.includes(value));
    return group ? filters[group.key].includes(value) : false;
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return actors.filter((a) => {
      const matchesQuery =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.stageName.toLowerCase().includes(q) ||
      a.hometown.toLowerCase().includes(q) ||
      a.credits.some((c) => c.title.toLowerCase().includes(q));
      const matchesDecade = !filters.decade.length || filters.decade.some((d) => a.decades.includes(d));
      const matchesGenre = !filters.genre.length || filters.genre.some((g) => a.genres.includes(g));
      const matchesNetwork = !filters.network.length || filters.network.includes(a.network);
      const matchesGender = !filters.gender.length || filters.gender.includes(a.gender);
      const matchesGen = !filters.generation.length || filters.generation.includes(a.generation);
      return matchesQuery && matchesDecade && matchesGenre && matchesNetwork && matchesGender && matchesGen;
    });
  }, [query, filters]);

  return (
    <div className="pb-6">
      <div className="sticky top-0 z-30 rounded-b-3xl bg-maroon-deep px-5 pb-4 pt-12">
        <h1 className="font-display text-[24px] font-black tracking-tight text-cream">Browse stars</h1>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <SearchIcon
              className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-maroon-soft"
              aria-hidden="true" />
            
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actors, shows, hometowns"
              aria-label="Search actors, shows and hometowns"
              className="w-full rounded-2xl border-0 bg-cream py-3 pl-11 pr-4 text-[14px] font-medium text-ink placeholder:text-maroon-soft/70 outline-none ring-0 focus:ring-2 focus:ring-gold" />
            
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label={`Open filters${activeCount ? `, ${activeCount} active` : ''}`}
            className="relative grid h-[46px] w-[46px] shrink-0 place-items-center rounded-2xl bg-maroon text-cream outline-none transition-colors duration-150 ease-smooth hover:bg-maroon-light focus-visible:ring-2 focus-visible:ring-gold">
            
            <SlidersHorizontalIcon className="h-5 w-5" aria-hidden="true" />
            {activeCount > 0 &&
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-[11px] font-black text-maroon-deep">
                {activeCount}
              </span>
            }
          </button>
        </div>

        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
          {quickFilters.map((f) =>
          <Chip key={f} label={f} tone="dark" selected={isQuickActive(f)} onClick={() => toggleQuick(f)} />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <p className="text-[13px] font-semibold text-maroon-deep/70">
          {results.length} {results.length === 1 ? 'star' : 'stars'}
        </p>
        {activeCount > 0 &&
        <button
          type="button"
          onClick={() => setFilters(emptyFilters)}
          className="text-[13px] font-bold text-maroon outline-none hover:text-maroon-light focus-visible:ring-2 focus-visible:ring-maroon">
          
            Clear filters
          </button>
        }
      </div>

      {results.length === 0 ?
      <div className="mx-5 rounded-3xl bg-white px-6 py-12 text-center shadow-card">
          <h2 className="font-display text-[17px] font-extrabold text-ink">No stars match that</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-maroon-deep/70">
            Try a different spelling, or loosen a filter or two.
          </p>
        </div> :

      <div className="grid grid-cols-2 gap-3 px-5">
          {results.map((actor) =>
        <ActorCard key={actor.id} actor={actor} />
        )}
        </div>
      }

      <AnimatePresence>
        {sheetOpen &&
        <>
            <motion.button
            type="button"
            aria-label="Close filters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => setSheetOpen(false)}
            className="fixed inset-0 z-40 bg-ink/50" />
          
            <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-0 left-1/2 z-50 max-h-[78vh] w-full max-w-[430px] -translate-x-1/2 overflow-y-auto rounded-t-4xl bg-cream px-5 pb-8 pt-5">
            
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[20px] font-extrabold text-ink">Filters</h2>
                <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close filters"
                className="grid h-9 w-9 place-items-center rounded-full bg-cream-200 text-maroon-deep outline-none transition-colors duration-150 ease-smooth hover:bg-cream-300 focus-visible:ring-2 focus-visible:ring-maroon">
                
                  <XIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              </div>

              {filterGroups.map((group) =>
            <fieldset key={group.key} className="mt-5">
                  <legend className="text-[12px] font-bold uppercase tracking-[0.16em] text-maroon-soft">
                    {group.label}
                  </legend>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {group.options.map((option) =>
                <Chip
                  key={option}
                  label={option}
                  selected={filters[group.key].includes(option)}
                  onClick={() => toggle(group.key, option)} />

                )}
                  </div>
                </fieldset>
            )}

              <div className="mt-7 flex gap-2.5">
                <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                className="flex-1 rounded-2xl bg-cream-200 py-3.5 font-display text-[14.5px] font-bold text-maroon-deep outline-none transition-colors duration-150 ease-smooth hover:bg-cream-300 focus-visible:ring-2 focus-visible:ring-maroon">
                
                  Reset
                </button>
                <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="flex-[2] rounded-2xl bg-maroon py-3.5 font-display text-[14.5px] font-bold text-cream outline-none transition-colors duration-150 ease-smooth hover:bg-maroon-light focus-visible:ring-2 focus-visible:ring-gold">
                
                  Show {results.length} results
                </button>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </div>);

}