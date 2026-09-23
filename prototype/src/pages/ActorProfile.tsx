import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AwardIcon,
  BookmarkIcon,
  CakeIcon,
  ChevronLeftIcon,
  InstagramIcon,
  MapPinIcon,
  MusicIcon,
  ShareIcon,
  TwitterIcon,
  TvIcon } from
'lucide-react';
import { actors, getActor } from '../data/actors';
import { slugify } from '../data/titles';
import { ActorCard } from '../components/ActorCard';
import { FavoriteButton, Rail, SectionHeading } from '../components/ui';
import { useFavorites } from '../contexts/FavoritesContext';

export function ActorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const actor = getActor(id);
  const { isFavoriteActor, toggleActor, isSavedTitle, toggleTitle } = useFavorites();

  if (!actor) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-8 text-center">
        <h1 className="font-display text-[22px] font-extrabold text-ink">Star not found</h1>
        <p className="text-[14px] text-maroon-deep/70">
          This profile may have been moved or renamed.
        </p>
        <Link
          to="/search"
          className="mt-2 rounded-full bg-maroon px-5 py-2.5 text-[14px] font-bold text-cream">
          
          Browse all stars
        </Link>
      </div>);

  }

  const favorited = isFavoriteActor(actor.id);
  const alsoLiked = actors.filter((a) => a.id !== actor.id && a.generation === actor.generation);
  const recommendations = (alsoLiked.length >= 3 ? alsoLiked : actors.filter((a) => a.id !== actor.id)).slice(0, 5);

  const facts = [
  { Icon: CakeIcon, label: 'Born', value: actor.birthdate },
  { Icon: MapPinIcon, label: 'Hometown', value: actor.hometown },
  { Icon: TvIcon, label: 'Network', value: `${actor.network} · ${actor.agency}` }];


  const socials = [
  actor.socials.instagram && { Icon: InstagramIcon, handle: actor.socials.instagram },
  actor.socials.x && { Icon: TwitterIcon, handle: actor.socials.x },
  actor.socials.tiktok && { Icon: MusicIcon, handle: actor.socials.tiktok }].
  filter(Boolean) as {Icon: typeof InstagramIcon;handle: string;}[];

  return (
    <div className="pb-8">
      <div className="relative">
        <div className="h-[420px] w-full overflow-hidden bg-maroon-deep">
          <img src={actor.photo} alt={actor.name} className="h-full w-full object-cover object-top" />
        </div>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-11">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="grid h-10 w-10 place-items-center rounded-full bg-ink/55 text-cream backdrop-blur-sm outline-none transition-colors duration-150 ease-smooth hover:bg-ink/75 focus-visible:ring-2 focus-visible:ring-gold">
            
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={`Share ${actor.name}'s profile`}
              className="grid h-10 w-10 place-items-center rounded-full bg-ink/55 text-cream backdrop-blur-sm outline-none transition-colors duration-150 ease-smooth hover:bg-ink/75 focus-visible:ring-2 focus-visible:ring-gold">
              
              <ShareIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            <FavoriteButton actorId={actor.id} name={actor.name} />
          </div>
        </div>
      </div>

      <div className="relative -mt-8 rounded-t-4xl bg-cream px-5 pt-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-maroon">
          {actor.stageName}
        </p>
        <h1 className="mt-1 font-display text-[30px] font-black leading-[1.05] tracking-tight text-ink">
          {actor.name}
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-maroon-deep/70">{actor.tagline}</p>

        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={() => toggleActor(actor.id)}
            aria-pressed={favorited}
            className={`flex-1 rounded-2xl py-3 font-display text-[14.5px] font-bold outline-none transition-colors duration-150 ease-smooth focus-visible:ring-2 focus-visible:ring-gold ${
            favorited ? 'bg-cream-200 text-maroon-deep' : 'bg-maroon text-cream hover:bg-maroon-light'}`
            }>
            
            {favorited ? 'Following' : 'Follow'}
          </button>
          <div className="flex items-center gap-1.5 rounded-2xl bg-cream-200 px-4">
            <span className="font-display text-[15px] font-black text-ink">{actor.followers}</span>
            <span className="text-[12px] font-semibold text-maroon-soft">fans</span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-cream-300 rounded-3xl bg-white px-4 shadow-card">
          {facts.map(({ Icon, label, value }) =>
          <div key={label} className="flex items-center gap-3 py-3">
              <Icon className="h-[18px] w-[18px] shrink-0 text-maroon" aria-hidden="true" />
              <dt className="w-24 shrink-0 text-[12.5px] font-semibold uppercase tracking-wide text-maroon-soft">
                {label}
              </dt>
              <dd className="min-w-0 flex-1 text-right text-[13.5px] font-semibold text-ink">{value}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6">
          <h2 className="font-display text-[19px] font-extrabold tracking-tight text-ink">Biography</h2>
          <p className="mt-2 text-[14px] leading-[1.65] text-maroon-deep/80">{actor.bio}</p>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[19px] font-extrabold tracking-tight text-ink">
              Filmography
            </h2>
            <p className="text-[12px] font-semibold text-maroon-soft">
              {actor.credits.length} credits
            </p>
          </div>
          <ul className="mt-3 space-y-2.5">
            {actor.credits.
            slice().
            sort((a, b) => b.year - a.year).
            map((credit) => {
              const titleId = slugify(credit.title);
              const saved = isSavedTitle(titleId);
              return (
                <li key={credit.id}>
                    <div className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-card">
                      <img
                      src={credit.poster}
                      alt=""
                      loading="lazy"
                      className="h-[68px] w-[50px] shrink-0 rounded-xl2 object-cover" />
                    
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-[15px] font-bold text-ink">
                          {credit.title}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-maroon-deep/70">as {credit.role}</p>
                        <p className="mt-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                          <span className="rounded-full bg-cream-200 px-2 py-0.5 text-maroon">
                            {credit.type}
                          </span>
                          <span className="text-maroon-soft">{credit.year}</span>
                        </p>
                      </div>
                      <button
                      type="button"
                      onClick={() => toggleTitle(titleId)}
                      aria-pressed={saved}
                      aria-label={
                      saved ?
                      `Remove ${credit.title} from watchlist` :
                      `Add ${credit.title} to watchlist`
                      }
                      className={`mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full outline-none transition-colors duration-150 ease-smooth focus-visible:ring-2 focus-visible:ring-maroon ${
                      saved ? 'bg-maroon text-cream' : 'bg-cream-200 text-maroon hover:bg-cream-300'}`
                      }>
                      
                        <BookmarkIcon
                        className={`h-[17px] w-[17px] ${saved ? 'fill-current' : ''}`}
                        aria-hidden="true" />
                      
                      </button>
                    </div>
                  </li>);

            })}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="font-display text-[19px] font-extrabold tracking-tight text-ink">
            Awards &amp; recognition
          </h2>
          <ul className="mt-3 divide-y divide-cream-300 rounded-3xl bg-white px-4 shadow-card">
            {actor.awards.map((award) =>
            <li key={award.id} className="flex items-center gap-3 py-3.5">
                <AwardIcon
                className={`h-5 w-5 shrink-0 ${award.won ? 'text-gold' : 'text-cream-400'}`}
                aria-hidden="true" />
              
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-ink">{award.title}</p>
                  <p className="truncate text-[12.5px] text-maroon-deep/70">
                    {award.org} · {award.year}
                  </p>
                </div>
                <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
                award.won ? 'bg-gold-pale text-gold-deep' : 'bg-cream-200 text-maroon-soft'}`
                }>
                
                  {award.won ? 'Won' : 'Nominated'}
                </span>
              </li>
            )}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="font-display text-[19px] font-extrabold tracking-tight text-ink">Follow online</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {socials.map(({ Icon, handle }) =>
            <a
              key={handle}
              href="#"
              className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2.5 shadow-card outline-none transition-colors duration-150 ease-smooth hover:bg-cream-200 focus-visible:ring-2 focus-visible:ring-maroon">
              
                <Icon className="h-4 w-4 text-maroon" aria-hidden="true" />
                <span className="text-[13px] font-semibold text-ink">{handle}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <section aria-labelledby="also-liked" className="mt-8">
        <div id="also-liked">
          <SectionHeading title="Fans also liked" />
        </div>
        <Rail>
          {recommendations.map((rec) =>
          <ActorCard key={rec.id} actor={rec} variant="rail" showFavorite={false} />
          )}
        </Rail>
      </section>
    </div>);

}