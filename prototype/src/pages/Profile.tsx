import React, { useState } from "react";
import { ChevronRightIcon, LogOutIcon, PencilIcon, ShieldIcon, BoxIcon } from "lucide-react";
import { Chip } from "../components/ui";
import { useFavorites } from "../contexts/FavoritesContext";
const allGenres = ['Drama', 'Romance', 'Comedy', 'Action', 'Fantasy', 'Period', 'Horror'];
const notificationSettings = [{
  id: 'breaking',
  label: 'Breaking showbiz news',
  hint: 'Awards, castings and major announcements'
}, {
  id: 'follows',
  label: 'Updates from stars I follow',
  hint: 'New projects and premiere dates'
}, {
  id: 'trivia',
  label: 'Daily trivia reminder',
  hint: 'One nudge at 8:00 PM'
}, {
  id: 'weekly',
  label: 'Weekly Pinoy digest',
  hint: 'Sunday recap of the week in showbiz'
}];
export function Profile() {
  const {
    actorIds,
    titleIds
  } = useFavorites();
  const [genres, setGenres] = useState<string[]>(['Drama', 'Romance', 'Comedy']);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    breaking: true,
    follows: true,
    trivia: false,
    weekly: true
  });
  const toggleGenre = (g: string) => setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  return <div className="pb-6">
      <header className="rounded-b-4xl bg-maroon-deep px-5 pb-7 pt-12 text-cream">
        <div className="flex items-center gap-4">
          <div className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-gold font-display text-[26px] font-black text-maroon-deep">
            MC
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[22px] font-black leading-tight">Maria Clara S.</h1>
            <p className="truncate text-[13px] text-cream-400">Quezon City · Member since 2024</p>
          </div>
          <button type="button" aria-label="Edit profile" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 outline-none transition-colors duration-150 ease-smooth hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-gold">
            <PencilIcon className="h-[17px] w-[17px]" aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-5 flex gap-2.5">
          {[{
          label: 'Following',
          value: actorIds.length
        }, {
          label: 'Watchlist',
          value: titleIds.length
        }, {
          label: 'Trivia wins',
          value: 27
        }].map((stat) => <div key={stat.label} className="flex-1 rounded-2xl bg-white/10 px-3 py-2.5 text-center">
              <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-cream-400">
                {stat.label}
              </dt>
              <dd className="mt-0.5 font-display text-[20px] font-black leading-none">{stat.value}</dd>
            </div>)}
        </dl>
      </header>

      <section className="px-5 pt-6">
        <h2 className="font-display text-[19px] font-extrabold tracking-tight text-ink">
          Genres you love
        </h2>
        <p className="mt-1 text-[13px] text-maroon-deep/70">
          We use these to pick your spotlight and trivia rounds.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {allGenres.map((g) => <Chip key={g} label={g} selected={genres.includes(g)} onClick={() => toggleGenre(g)} />)}
        </div>
      </section>

      <section className="px-5 pt-7">
        <h2 className="font-display text-[19px] font-extrabold tracking-tight text-ink">Notifications</h2>
        <ul className="mt-3 divide-y divide-cream-300 rounded-3xl bg-white px-4 shadow-card">
          {notificationSettings.map((setting) => {
          const on = enabled[setting.id];
          return <li key={setting.id} className="flex items-center gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-ink">{setting.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-maroon-deep/65">{setting.hint}</p>
                </div>
                <button type="button" role="switch" aria-checked={on} aria-label={setting.label} onClick={() => setEnabled((prev) => ({
              ...prev,
              [setting.id]: !prev[setting.id]
            }))} className={`relative h-[30px] w-[52px] shrink-0 rounded-full outline-none transition-colors duration-150 ease-smooth focus-visible:ring-2 focus-visible:ring-maroon ${on ? 'bg-maroon' : 'bg-cream-300'}`}>
                  <span className={`absolute top-[3px] h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-smooth ${on ? 'translate-x-[25px]' : 'translate-x-[3px]'}`} />
                </button>
              </li>;
        })}
        </ul>
      </section>

      <section className="px-5 pt-7">
        <h2 className="sr-only">Account</h2>
        <ul className="divide-y divide-cream-300 rounded-3xl bg-white px-4 shadow-card">
          {[{
          Icon: ShieldIcon,
          label: 'Privacy & data'
        }, {
          Icon: BoxIcon,
          label: 'Help & feedback'
        }, {
          Icon: LogOutIcon,
          label: 'Sign out'
        }].map(({
          Icon,
          label
        }) => <li key={label}>
              <button type="button" className="flex w-full items-center gap-3 py-3.5 text-left outline-none transition-opacity duration-150 ease-smooth hover:opacity-70 focus-visible:ring-2 focus-visible:ring-maroon">
                <Icon className="h-[18px] w-[18px] shrink-0 text-maroon" aria-hidden="true" />
                <span className="flex-1 text-[14px] font-bold text-ink">{label}</span>
                <ChevronRightIcon className="h-4 w-4 text-cream-400" aria-hidden="true" />
              </button>
            </li>)}
        </ul>
        <p className="mt-5 text-center text-[11.5px] text-maroon-deep/50">
          PinoyStars v2.4 · Profiles shown are fictional
        </p>
      </section>
    </div>;
}