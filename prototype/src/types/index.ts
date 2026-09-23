export type Network = 'ABS-CBN' | 'GMA' | 'Viva' | 'TV5' | 'Independent';

export type Generation = 'Legends' | 'Millennial' | 'Gen Z';

export type Gender = 'Female' | 'Male';

export type CreditType = 'Movie' | 'Teleserye' | 'Series';

export interface Credit {
  id: string;
  title: string;
  year: number;
  type: CreditType;
  role: string;
  poster: string;
}

export interface Award {
  id: string;
  title: string;
  org: string;
  year: number;
  won: boolean;
}

export interface Socials {
  instagram?: string;
  x?: string;
  tiktok?: string;
}

export interface Actor {
  id: string;
  name: string;
  stageName: string;
  tagline: string;
  birthdate: string;
  hometown: string;
  network: Network;
  agency: string;
  generation: Generation;
  gender: Gender;
  decades: string[];
  genres: string[];
  followers: string;
  bio: string;
  photo: string;
  credits: Credit[];
  awards: Award[];
  socials: Socials;
}

export interface NewsItem {
  id: string;
  headline: string;
  excerpt: string;
  source: string;
  minutesRead: number;
  publishedAgo: string;
  image: string;
  tag: string;
}

export interface TriviaQuestion {
  id: string;
  prompt: string;
  photo: string;
  choices: string[];
  answerIndex: number;
  fact: string;
}