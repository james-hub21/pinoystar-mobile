import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  HomeIcon,
  SearchIcon,
  SparklesIcon,
  UserIcon } from
'lucide-react';

const items = [
{ to: '/', label: 'Home', Icon: HomeIcon },
{ to: '/search', label: 'Search', Icon: SearchIcon },
{ to: '/trivia', label: 'Trivia', Icon: SparklesIcon },
{ to: '/favorites', label: 'Favorites', Icon: HeartIcon },
{ to: '/profile', label: 'Profile', Icon: UserIcon }];


export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-maroon-light/40 bg-maroon-deep px-2 pb-5 pt-2 shadow-nav">
      
      <ul className="flex items-stretch justify-between">
        {items.map(({ to, label, Icon }) =>
        <li key={to} className="flex-1">
            <NavLink
            to={to}
            end={to === '/'}
            className="group relative flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 outline-none transition-colors duration-150 ease-smooth focus-visible:ring-2 focus-visible:ring-gold">
            
              {({ isActive }) =>
            <>
                  {isActive &&
              <motion.span
                layoutId="nav-pill"
                transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                className="absolute inset-0 rounded-2xl bg-maroon"
                aria-hidden="true" />

              }
                  <Icon
                className={`relative h-[22px] w-[22px] transition-colors duration-150 ease-smooth ${
                isActive ? 'text-gold-light' : 'text-cream-400 group-hover:text-cream-200'}`
                }
                strokeWidth={isActive ? 2.4 : 1.9}
                aria-hidden="true" />
              
                  <span
                className={`relative text-[10px] font-semibold tracking-wide ${
                isActive ? 'text-cream' : 'text-cream-400'}`
                }>
                
                    {label}
                  </span>
                </>
            }
            </NavLink>
          </li>
        )}
      </ul>
    </nav>);

}