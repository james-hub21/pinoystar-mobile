import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { BottomNav } from './components/BottomNav';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './pages/Home';
import { ActorProfile } from './pages/ActorProfile';
import { Search } from './pages/Search';
import { Trivia } from './pages/Trivia';
import { Favorites } from './pages/Favorites';
import { Profile } from './pages/Profile';

export function App() {
  return (
    <FavoritesProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex min-h-full w-full justify-center bg-ink font-sans">
          <div className="relative w-full max-w-[430px] bg-cream shadow-lift">
            <main className="min-h-screen pb-28">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/actor/:id" element={<ActorProfile />} />
                <Route path="/search" element={<Search />} />
                <Route path="/trivia" element={<Trivia />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </div>
      </BrowserRouter>
    </FavoritesProvider>);

}