import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Native apps always land a new screen at the top — the browser does not, so do it here. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}