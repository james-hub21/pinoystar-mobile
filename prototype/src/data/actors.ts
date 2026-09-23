import type { Actor } from '../types';

const CDN = "/generated-images";

export const PHOTOS = {
  amihan: `${CDN}/17602f1d-e140-4499-bd04-5bc3766ea635.jpg`,
  liway: `${CDN}/9d4769b6-a478-413a-8186-94df3255c866.jpg`,
  manny: `${CDN}/b1f22c14-5270-4ade-a4cb-48681f6fe5c5.jpg`,
  charing: `${CDN}/e6433126-ad7a-46b8-a17f-79f520e9e636.jpg`,
  nanding: `${CDN}/0a960d85-ea46-4008-8f50-467e244fe7e6.jpg`,
  bibi: `${CDN}/b2c58b29-f80d-4dd9-8289-ff2562f67749.jpg`,
  rafa: `${CDN}/b576de6d-785b-4f63-b481-ac925c33d970.jpg`,
  redCarpet: `${CDN}/8cf3c7a5-a577-4d59-911a-913afba2da49.jpg`,
  filmSet: `${CDN}/d957ad9a-ed75-4fa6-9a89-bc5082fd4b9b.jpg`,
  poster: `${CDN}/7aeb84a6-0fd4-40f4-b40e-1191f0e11e12.jpg`
};

export const actors: Actor[] = [
{
  id: 'amihan-reyes',
  name: 'Amihan Reyes',
  stageName: 'Ang Reyna ng Drama',
  tagline: 'Box-office royalty with four Best Actress trophies',
  birthdate: 'March 14, 1991',
  hometown: 'Iloilo City, Iloilo',
  network: 'ABS-CBN',
  agency: 'Star Magic',
  generation: 'Millennial',
  gender: 'Female',
  decades: ['2010s', '2020s'],
  genres: ['Drama', 'Romance'],
  followers: '12.4M',
  bio: 'Discovered at sixteen in a mall talent search in Iloilo, Amihan Reyes spent five years in supporting roles before "Hanggang Umaga" turned her into the most bankable dramatic lead of her generation. Critics point to her stillness — long, unblinking takes that carry an entire scene without dialogue. She now splits her time between primetime teleseryes and independent films, and produces two of them a year through her own outfit, Habagat Pictures.',
  photo: PHOTOS.amihan,
  credits: [
  { id: 'c1', title: 'Hanggang Umaga', year: 2016, type: 'Movie', role: 'Teresa', poster: PHOTOS.poster },
  { id: 'c2', title: 'Alon at Apoy', year: 2019, type: 'Teleserye', role: 'Marisol Benitez', poster: PHOTOS.filmSet },
  { id: 'c3', title: 'Ang Huling Liham', year: 2021, type: 'Movie', role: 'Elena', poster: PHOTOS.poster },
  { id: 'c4', title: 'Bituin sa Maynila', year: 2023, type: 'Teleserye', role: 'Dra. Paz Alcantara', poster: PHOTOS.redCarpet },
  { id: 'c5', title: 'Salamin', year: 2025, type: 'Movie', role: 'Nora', poster: PHOTOS.poster }],

  awards: [
  { id: 'a1', title: 'Best Actress', org: 'Gawad Urian', year: 2022, won: true },
  { id: 'a2', title: 'Best Actress', org: 'Metro Manila Film Festival', year: 2021, won: true },
  { id: 'a3', title: 'Best Drama Actress', org: 'PMPC Star Awards for TV', year: 2020, won: true },
  { id: 'a4', title: 'Best Actress', org: 'FAMAS Awards', year: 2019, won: false }],

  socials: { instagram: '@amihanreyes', x: '@amihanreyes', tiktok: '@amihan' }
},
{
  id: 'liway-santillan',
  name: 'Liwayway Santillan',
  stageName: 'Liway',
  tagline: 'Kapuso primetime lead and 2024 Gawad Sining honoree',
  birthdate: 'August 2, 1993',
  hometown: 'Lipa, Batangas',
  network: 'GMA',
  agency: 'Sparkle GMA Artist Center',
  generation: 'Millennial',
  gender: 'Female',
  decades: ['2010s', '2020s'],
  genres: ['Drama', 'Fantasy', 'Romance'],
  followers: '8.9M',
  bio: 'Liway came up through fantaseryes, where she learned to sell the impossible with a straight face — and then spent the next decade proving she could do the same with ordinary heartbreak. Her turn as a working mother in "Gabi ng Liwanag" was the highest-rated Kapuso finale in six years. Offscreen she runs a scholarship fund for public-school drama students in Batangas.',
  photo: PHOTOS.liway,
  credits: [
  { id: 'c1', title: 'Gabi ng Liwanag', year: 2022, type: 'Teleserye', role: 'Amparo', poster: PHOTOS.filmSet },
  { id: 'c2', title: 'Diwata', year: 2018, type: 'Teleserye', role: 'Diwata Maghari', poster: PHOTOS.poster },
  { id: 'c3', title: 'Tahanan', year: 2020, type: 'Movie', role: 'Sister Cecilia', poster: PHOTOS.poster },
  { id: 'c4', title: 'Kung Sakaling Ikaw', year: 2024, type: 'Movie', role: 'Rina', poster: PHOTOS.redCarpet }],

  awards: [
  { id: 'a1', title: 'Best Actress', org: 'Gawad Sining', year: 2024, won: true },
  { id: 'a2', title: 'Best Primetime Actress', org: 'PMPC Star Awards for TV', year: 2023, won: true },
  { id: 'a3', title: 'Movie Actress of the Year', org: 'GMMSF Box-Office Entertainment', year: 2021, won: false }],

  socials: { instagram: '@liwaysantillan', tiktok: '@liway' }
},
{
  id: 'manny-dalisay',
  name: 'Emmanuel Dalisay',
  stageName: 'Manny D',
  tagline: 'Action-comedy lead turned indie-film favorite',
  birthdate: 'November 28, 1990',
  hometown: 'Cebu City, Cebu',
  network: 'Viva',
  agency: 'Viva Artists Agency',
  generation: 'Millennial',
  gender: 'Male',
  decades: ['2010s', '2020s'],
  genres: ['Action', 'Comedy', 'Drama'],
  followers: '6.2M',
  bio: 'Manny Dalisay started as a stuntman on Viva action pictures and still does most of his own falls. His comic timing was an accident — a director kept the improvised takes — and it made him the rare Filipino leading man who opens both an action tentpole and a two-hander shot on a single Cebu street. He is unusually protective of his rest days and has spoken publicly about set safety.',
  photo: PHOTOS.manny,
  credits: [
  { id: 'c1', title: 'Bagsik', year: 2017, type: 'Movie', role: 'Sgt. Dante Rivas', poster: PHOTOS.poster },
  { id: 'c2', title: 'Pare Ko, Pare Mo', year: 2019, type: 'Movie', role: 'Boyet', poster: PHOTOS.redCarpet },
  { id: 'c3', title: 'Ang Batang Tubig', year: 2023, type: 'Movie', role: 'Berto', poster: PHOTOS.poster },
  { id: 'c4', title: 'Kalye Kings', year: 2024, type: 'Series', role: 'Andres', poster: PHOTOS.filmSet }],

  awards: [
  { id: 'a1', title: 'Best Actor', org: 'Cinemalaya', year: 2023, won: true },
  { id: 'a2', title: 'Best Actor', org: 'FAMAS Awards', year: 2024, won: false }],

  socials: { instagram: '@mannydalisay', x: '@mannyd' }
},
{
  id: 'charing-villanueva',
  name: 'Rosario Villanueva',
  stageName: 'Tita Charing',
  tagline: 'Five decades on screen, and the Kapamilya matriarch of them all',
  birthdate: 'June 9, 1961',
  hometown: 'Vigan, Ilocos Sur',
  network: 'ABS-CBN',
  agency: 'Star Magic',
  generation: 'Legends',
  gender: 'Female',
  decades: ['1980s', '1990s', '2000s', '2010s', '2020s'],
  genres: ['Drama', 'Period', 'Comedy'],
  followers: '4.1M',
  bio: 'Rosario "Charing" Villanueva made her first film in 1979 and has not gone a year without a credit since. She is the industry\'s reigning matriarch — the mother, the lola, the judge — and the person younger actors quote when asked about discipline. Her one-take monologue in "Ang Huling Liham" is taught in film schools. She was named a National Artist nominee for Film in 2024.',
  photo: PHOTOS.charing,
  credits: [
  { id: 'c1', title: 'Mga Anak ng Bagyo', year: 1987, type: 'Movie', role: 'Lourdes', poster: PHOTOS.poster },
  { id: 'c2', title: 'Panahon ng Tag-init', year: 1996, type: 'Teleserye', role: 'Aling Feling', poster: PHOTOS.filmSet },
  { id: 'c3', title: 'Ang Huling Liham', year: 2021, type: 'Movie', role: 'Nanay Charing', poster: PHOTOS.poster },
  { id: 'c4', title: 'Bituin sa Maynila', year: 2023, type: 'Teleserye', role: 'Doña Pilar', poster: PHOTOS.redCarpet }],

  awards: [
  { id: 'a1', title: 'Lifetime Achievement', org: 'FAMAS Awards', year: 2023, won: true },
  { id: 'a2', title: 'Best Supporting Actress', org: 'Gawad Urian', year: 2021, won: true },
  { id: 'a3', title: 'Best Actress', org: 'Metro Manila Film Festival', year: 1996, won: true }],

  socials: { instagram: '@titacharing' }
},
{
  id: 'nanding-aguilar',
  name: 'Fernando Aguilar',
  stageName: 'Nanding',
  tagline: 'The Kapuso character actor who steals every scene',
  birthdate: 'January 22, 1959',
  hometown: 'Malolos, Bulacan',
  network: 'GMA',
  agency: 'GMA Artist Center',
  generation: 'Legends',
  gender: 'Male',
  decades: ['1980s', '1990s', '2000s', '2010s', '2020s'],
  genres: ['Drama', 'Period', 'Action'],
  followers: '2.7M',
  bio: 'A stage actor first, Fernando Aguilar spent the eighties in Bulacan community theater before television found him. He has played the father, the villain, the priest and the president — often in the same season — and remains the industry\'s most requested table-read partner for young leads. He teaches a free Saturday acting workshop in Malolos that has run for nineteen years.',
  photo: PHOTOS.nanding,
  credits: [
  { id: 'c1', title: 'Alon at Apoy', year: 2019, type: 'Teleserye', role: 'Don Emilio', poster: PHOTOS.filmSet },
  { id: 'c2', title: 'Rebolusyon 1896', year: 2005, type: 'Movie', role: 'Heneral Basa', poster: PHOTOS.poster },
  { id: 'c3', title: 'Gabi ng Liwanag', year: 2022, type: 'Teleserye', role: 'Tatay Berting', poster: PHOTOS.redCarpet },
  { id: 'c4', title: 'Salamin', year: 2025, type: 'Movie', role: 'Mang Ponso', poster: PHOTOS.poster }],

  awards: [
  { id: 'a1', title: 'Best Supporting Actor', org: 'Gawad Urian', year: 2020, won: true },
  { id: 'a2', title: 'Best Single Performance', org: 'PMPC Star Awards for TV', year: 2015, won: true }],

  socials: { instagram: '@nandingaguilar', x: '@nandinga' }
},
{
  id: 'bibi-manalo',
  name: 'Bianca Manalo',
  stageName: 'Bibi',
  tagline: 'The Gen Z breakout with 3.2M in eight months',
  birthdate: 'February 17, 2003',
  hometown: 'Davao City, Davao del Sur',
  network: 'ABS-CBN',
  agency: 'Star Magic',
  generation: 'Gen Z',
  gender: 'Female',
  decades: ['2020s'],
  genres: ['Romance', 'Comedy', 'Drama'],
  followers: '3.2M',
  bio: 'Bibi Manalo posted a two-minute monologue from her Davao bedroom in 2024; it was reposted by a casting director and she was on a Star Magic set within the month. She has since carried a streaming romance and a horror anthology episode, and is the youngest actress ever shortlisted for a Gawad Urian acting nod. She still edits her own vlogs.',
  photo: PHOTOS.bibi,
  credits: [
  { id: 'c1', title: 'Sana All', year: 2024, type: 'Series', role: 'Yumi', poster: PHOTOS.redCarpet },
  { id: 'c2', title: 'Kung Sakaling Ikaw', year: 2024, type: 'Movie', role: 'Jamie', poster: PHOTOS.poster },
  { id: 'c3', title: 'Salamin', year: 2025, type: 'Movie', role: 'Young Nora', poster: PHOTOS.poster }],

  awards: [
  { id: 'a1', title: 'Breakthrough Performance', org: 'Gawad Sining', year: 2025, won: true },
  { id: 'a2', title: 'Best Actress', org: 'Gawad Urian', year: 2025, won: false }],

  socials: { instagram: '@bibimanalo', tiktok: '@bibi' }
},
{
  id: 'rafa-ocampo',
  name: 'Rafael Ocampo',
  stageName: 'Rafa',
  tagline: 'Sparkle\'s young leading man and reluctant heartthrob',
  birthdate: 'September 5, 2001',
  hometown: 'Baguio City, Benguet',
  network: 'GMA',
  agency: 'Sparkle GMA Artist Center',
  generation: 'Gen Z',
  gender: 'Male',
  decades: ['2020s'],
  genres: ['Romance', 'Comedy', 'Action'],
  followers: '2.9M',
  bio: 'Rafa Ocampo was a competitive swimmer in Baguio until a shampoo commercial changed the plan. Three years in, he has learned to lean away from the heartthrob framing — his best work so far is a quiet, unglamorous turn as a delivery rider in "Kalye Kings". He is currently studying film production between shoots.',
  photo: PHOTOS.rafa,
  credits: [
  { id: 'c1', title: 'Kalye Kings', year: 2024, type: 'Series', role: 'Nico', poster: PHOTOS.filmSet },
  { id: 'c2', title: 'Sana All', year: 2024, type: 'Series', role: 'Migs', poster: PHOTOS.redCarpet },
  { id: 'c3', title: 'Bituin sa Maynila', year: 2023, type: 'Teleserye', role: 'Julio', poster: PHOTOS.poster }],

  awards: [{ id: 'a1', title: 'Male Star of the Night', org: 'Sparkle Gala', year: 2025, won: true }],
  socials: { instagram: '@rafaocampo', tiktok: '@rafa' }
}];


export const getActor = (id: string | undefined): Actor | undefined =>
actors.find((a) => a.id === id);

export const spotlightIds = ['amihan-reyes', 'charing-villanueva', 'manny-dalisay'];

export const trendingIds = [
'bibi-manalo',
'liway-santillan',
'rafa-ocampo',
'amihan-reyes',
'nanding-aguilar'];