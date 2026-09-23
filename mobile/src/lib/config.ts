import { Platform } from 'react-native';

/**
 * Base URL of our custom REST API (the Next.js app in /api).
 * - Production: your Vercel URL, set EXPO_PUBLIC_API_URL in mobile/.env
 * - Android emulator + local API: http://10.0.2.2:3000 (the emulator's alias for your PC)
 * - Expo Go on a real phone + local API: http://<your PC's LAN IP>:3000
 */
const fallback = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || fallback).replace(/\/$/, '');

/** Third-party API: Wikipedia REST (no key needed). */
export const WIKIPEDIA_REST = 'https://en.wikipedia.org/api/rest_v1';
export const WIKIPEDIA_SEARCH = 'https://en.wikipedia.org/w/rest.php/v1/search/page';
/**
 * Wikimedia requires a descriptive User-Agent with contact info and blocks generic library agents
 * (Android's default "okhttp/x" gets HTTP 403). See https://meta.wikimedia.org/wiki/User-Agent_policy
 */
export const WIKI_USER_AGENT = 'PinoyStars/1.0 (https://github.com/james-hub21/pinoystar-mobile; student midterm project)';
