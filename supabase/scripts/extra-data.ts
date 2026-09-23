// Five more fictional stars, extra news and trivia rounds — added on top of the prototype's data.
import type { Actor, NewsItem, TriviaQuestion } from '../../prototype/src/types';

const P = ''; // photos/posters are assigned by build-seed.ts

export const extraActors: Actor[] = [
  {
    id: 'dindo-salazar',
    name: 'Rodolfo Salazar',
    stageName: 'Dindo',
    tagline: 'The Kapatid comedy king who never misses a punchline',
    birthdate: 'April 30, 1965',
    hometown: 'San Fernando, Pampanga',
    network: 'TV5',
    agency: 'Cornerstone Talents',
    generation: 'Legends',
    gender: 'Male',
    decades: ['1980s', '1990s', '2000s', '2010s', '2020s'],
    genres: ['Comedy', 'Drama'],
    followers: '3.8M',
    bio: 'Dindo Salazar started out doing impressions at Pampanga fiestas and hasn\'t stopped making the country laugh since. His Sunday sitcom "Bahay ni Kuya Dindo" ran for eleven seasons, and his late-career dramatic turn as a grieving jeepney driver surprised critics who had only seen the clown. He still writes his own material and tests every joke on his grandchildren first.',
    photo: P,
    credits: [
      { id: 'c1', title: 'Bahay ni Kuya Dindo', year: 1998, type: 'Series', role: 'Kuya Dindo', poster: P },
      { id: 'c2', title: 'Biyaheng Langit', year: 2018, type: 'Movie', role: 'Mang Isko', poster: P },
      { id: 'c3', title: 'Pare Ko, Pare Mo', year: 2019, type: 'Movie', role: 'Tito Bong', poster: P },
    ],
    awards: [
      { id: 'a1', title: 'Best Comedy Actor', org: 'PMPC Star Awards for TV', year: 2004, won: true },
      { id: 'a2', title: 'Best Actor', org: 'Metro Manila Film Festival', year: 2018, won: true },
    ],
    socials: { instagram: '@dindosalazar', x: '@kuyadindo' },
  },
  {
    id: 'isay-dimaculangan',
    name: 'Maria Luisa Dimaculangan',
    stageName: 'Isay',
    tagline: 'Queen of Pinoy horror with a scream heard nationwide',
    birthdate: 'October 31, 1992',
    hometown: 'Legazpi City, Albay',
    network: 'TV5',
    agency: 'Cornerstone Talents',
    generation: 'Millennial',
    gender: 'Female',
    decades: ['2010s', '2020s'],
    genres: ['Horror', 'Drama', 'Fantasy'],
    followers: '5.1M',
    bio: 'Isay Dimaculangan grew up on her lola\'s aswang stories in the shadow of Mayon, and she brings that folklore to every role. Her "Tiyanak Trilogy" is the most-watched Filipino horror franchise on streaming, and she insists on doing her own underwater scenes. Between frights she hosts a podcast on Bicolano myths.',
    photo: P,
    credits: [
      { id: 'c1', title: 'Tiyanak Trilogy', year: 2017, type: 'Movie', role: 'Celeste', poster: P },
      { id: 'c2', title: 'Hatinggabi', year: 2021, type: 'Series', role: 'Nurse Lorna', poster: P },
      { id: 'c3', title: 'Alon at Apoy', year: 2019, type: 'Teleserye', role: 'Isadora', poster: P },
    ],
    awards: [
      { id: 'a1', title: 'Best Actress', org: 'Cinemalaya', year: 2021, won: true },
      { id: 'a2', title: 'Best Actress', org: 'FAMAS Awards', year: 2022, won: false },
    ],
    socials: { instagram: '@isaydimaculangan', tiktok: '@isayscreams' },
  },
  {
    id: 'kaloy-mendoza',
    name: 'Carlos Mendoza',
    stageName: 'Kaloy',
    tagline: 'Indie cinema\'s quiet storm from Tacloban',
    birthdate: 'December 8, 2000',
    hometown: 'Tacloban City, Leyte',
    network: 'Independent',
    agency: 'Habagat Pictures',
    generation: 'Gen Z',
    gender: 'Male',
    decades: ['2020s'],
    genres: ['Drama', 'Period'],
    followers: '1.4M',
    bio: 'Kaloy Mendoza was thirteen when Typhoon Yolanda flattened his neighborhood; a decade later he played a survivor in "Ang Batang Tubig" and made grown critics cry at Cinemalaya. He works almost exclusively in independent film, chooses projects by script alone, and has turned down two primetime teleserye offers to stay in Leyte with his family.',
    photo: P,
    credits: [
      { id: 'c1', title: 'Ang Batang Tubig', year: 2023, type: 'Movie', role: 'Junjun', poster: P },
      { id: 'c2', title: 'Probinsyano Blues', year: 2022, type: 'Movie', role: 'Dodong', poster: P },
      { id: 'c3', title: 'Himig ng Isla', year: 2025, type: 'Movie', role: 'Elias', poster: P },
    ],
    awards: [
      { id: 'a1', title: 'Best Actor', org: 'Gawad Urian', year: 2024, won: true },
      { id: 'a2', title: 'Breakthrough Performance', org: 'Gawad Sining', year: 2023, won: true },
    ],
    socials: { instagram: '@kaloymendoza' },
  },
  {
    id: 'ligaya-tan',
    name: 'Ligaya Tan',
    stageName: 'Gaya',
    tagline: 'Viva\'s rom-com sweetheart from Zamboanga',
    birthdate: 'May 21, 2002',
    hometown: 'Zamboanga City, Zamboanga del Sur',
    network: 'Viva',
    agency: 'Viva Artists Agency',
    generation: 'Gen Z',
    gender: 'Female',
    decades: ['2020s'],
    genres: ['Romance', 'Comedy'],
    followers: '4.6M',
    bio: 'Gaya Tan sings, dances and speaks four languages — Chavacano, Tagalog, English and Hokkien — and uses all of them on set. Her streaming rom-com "Tadhana Delivery" topped the local charts for nine weeks. She is known for learning every crew member\'s name by the second shooting day.',
    photo: P,
    credits: [
      { id: 'c1', title: 'Tadhana Delivery', year: 2024, type: 'Series', role: 'Joy', poster: P },
      { id: 'c2', title: 'Kung Sakaling Ikaw', year: 2024, type: 'Movie', role: 'Bea', poster: P },
      { id: 'c3', title: 'Sana All', year: 2024, type: 'Series', role: 'Pia', poster: P },
    ],
    awards: [
      { id: 'a1', title: 'New Movie Actress of the Year', org: 'PMPC Star Awards for Movies', year: 2025, won: true },
    ],
    socials: { instagram: '@ligayatan', tiktok: '@gaya' },
  },
  {
    id: 'ramon-estrella',
    name: 'Ramon Estrella',
    stageName: 'Mon',
    tagline: 'Kapamilya action star who trained with the Coast Guard',
    birthdate: 'July 12, 1988',
    hometown: 'Cagayan de Oro, Misamis Oriental',
    network: 'ABS-CBN',
    agency: 'Star Magic',
    generation: 'Millennial',
    gender: 'Male',
    decades: ['2010s', '2020s'],
    genres: ['Action', 'Drama'],
    followers: '7.3M',
    bio: 'Mon Estrella spent six months with the Philippine Coast Guard preparing for "Bantay Dagat" and came out a certified rescue swimmer. The series made him primetime\'s most reliable action lead, but his favorite role is the soft-spoken father in the family drama "Tahanan". He runs a free swimming clinic for kids every summer in Cagayan de Oro.',
    photo: P,
    credits: [
      { id: 'c1', title: 'Bantay Dagat', year: 2020, type: 'Teleserye', role: 'Lt. Gabriel Cruz', poster: P },
      { id: 'c2', title: 'Tahanan', year: 2020, type: 'Movie', role: 'Jose', poster: P },
      { id: 'c3', title: 'Bagsik', year: 2017, type: 'Movie', role: 'Officer Lando', poster: P },
      { id: 'c4', title: 'Bituin sa Maynila', year: 2023, type: 'Teleserye', role: 'Dr. Marco Alcantara', poster: P },
    ],
    awards: [
      { id: 'a1', title: 'Best Drama Actor', org: 'PMPC Star Awards for TV', year: 2021, won: true },
      { id: 'a2', title: 'Best Actor', org: 'Metro Manila Film Festival', year: 2020, won: false },
    ],
    socials: { instagram: '@monestrella', x: '@monestrella' },
  },
];

export const extraSpotlight = ['isay-dimaculangan'];
export const extraTrending = ['ligaya-tan', 'ramon-estrella', 'kaloy-mendoza'];

export const extraNews: NewsItem[] = [
  {
    id: 'n5',
    headline: 'Isay Dimaculangan confirms a fourth "Tiyanak" film',
    excerpt: 'The horror queen says the new chapter will be shot entirely at night in the forests of Albay.',
    source: 'Sine Manila',
    minutesRead: 3,
    publishedAgo: '2 days ago',
    image: '',
    tag: 'Horror',
  },
  {
    id: 'n6',
    headline: 'Kaloy Mendoza\'s "Himig ng Isla" opens Cinemalaya',
    excerpt: 'The Tacloban-born actor returns to the festival that launched him, this time as a lead and co-writer.',
    source: 'Indie Pinoy',
    minutesRead: 5,
    publishedAgo: '3 days ago',
    image: '',
    tag: 'Indie',
  },
];

/** Longer article bodies for the news detail screen, keyed by news id. */
export const newsBodies: Record<string, string> = {
  n1: 'Amihan Reyes walked into the Gawad Sining ballroom as the favorite and left with the night\'s biggest prize, her fourth Best Actress trophy in six years.\n\nIn a short, tearful speech she thanked her late acting coach from Iloilo, who first taught her to "let the silence do the work." "Salamin" also won Best Picture and Best Screenplay, making it the most awarded film of the season.',
  n2: 'The street-racing drama "Kalye Kings" has been renewed for a second season after becoming the most-streamed local series of the year.\n\nProduction moves to Cebu in January. Manny Dalisay and Rafa Ocampo are both confirmed to return, and the showrunners promise "fewer cars, more heart" in the new episodes.',
  n3: 'Rosario "Tita Charing" Villanueva has been named a National Artist nominee for Film, capping a career of forty-six years and one hundred and twelve credits.\n\nColleagues across networks celebrated the news. Younger actors describe her as the industry\'s conscience: first on set, last to leave, and never late with a line.',
  n4: 'Bibi Manalo has signed a two-picture deal with Habagat Pictures, the production outfit founded by Amihan Reyes.\n\nThe first film is a coming-of-age drama to be shot entirely in Davao next summer. Manalo says she wants to show "the Davao I grew up in, not the postcard version."',
  n5: 'Isay Dimaculangan has confirmed that a fourth "Tiyanak" film is in development, with shooting scheduled at night in the forests around Mayon Volcano.\n\nThe actress, who is also a producer on the franchise, promises the scariest chapter yet and a deeper dive into Bicolano folklore.',
  n6: '"Himig ng Isla", starring and co-written by Kaloy Mendoza, will open this year\'s Cinemalaya festival.\n\nThe film follows a young fisherman who composes songs to remember the people his island lost. Mendoza calls it "a love letter to Leyte" and says every extra in the film is a local from Tacloban.',
};

export const extraTrivia: TriviaQuestion[] = [
  {
    id: 'q7',
    prompt: 'Eleven seasons of Sunday sitcom laughs. Who is this Kapatid legend?',
    photo: P,
    choices: ['Fernando Aguilar', 'Rodolfo Salazar', 'Emmanuel Dalisay', 'Ramon Estrella'],
    answerIndex: 1,
    fact: 'Dindo tests every joke on his grandchildren before it airs.',
  },
  {
    id: 'q8',
    prompt: 'This horror queen does her own underwater scenes. Name her.',
    photo: P,
    choices: ['Maria Luisa Dimaculangan', 'Ligaya Tan', 'Bianca Manalo', 'Liwayway Santillan'],
    answerIndex: 0,
    fact: 'Isay hosts a podcast about Bicolano myths between films.',
  },
  {
    id: 'q9',
    prompt: 'Indie star who turned down primetime to stay in Leyte.',
    photo: P,
    choices: ['Rafael Ocampo', 'Ramon Estrella', 'Carlos Mendoza', 'Emmanuel Dalisay'],
    answerIndex: 2,
    fact: 'Kaloy won Best Actor at the Gawad Urian for "Ang Batang Tubig".',
  },
  {
    id: 'q10',
    prompt: 'She speaks Chavacano, Tagalog, English and Hokkien on set.',
    photo: P,
    choices: ['Bianca Manalo', 'Amihan Reyes', 'Maria Luisa Dimaculangan', 'Ligaya Tan'],
    answerIndex: 3,
    fact: '"Tadhana Delivery" topped the local streaming charts for nine weeks.',
  },
  {
    id: 'q11',
    prompt: 'Certified rescue swimmer and primetime action lead. Who?',
    photo: P,
    choices: ['Ramon Estrella', 'Rafael Ocampo', 'Rodolfo Salazar', 'Carlos Mendoza'],
    answerIndex: 0,
    fact: 'Mon trained with the Philippine Coast Guard for six months for "Bantay Dagat".',
  },
  {
    id: 'q12',
    prompt: 'Bulacan theater veteran with a free Saturday acting workshop.',
    photo: P,
    choices: ['Rodolfo Salazar', 'Emmanuel Dalisay', 'Fernando Aguilar', 'Ramon Estrella'],
    answerIndex: 2,
    fact: 'Nanding\'s Malolos workshop has run every Saturday for nineteen years.',
  },
];

/** Which actor each trivia question pictures (prototype used a photo field instead). */
export const triviaActor: Record<string, string> = {
  q1: 'amihan-reyes', q2: 'liway-santillan', q3: 'manny-dalisay', q4: 'charing-villanueva',
  q5: 'bibi-manalo', q6: 'rafa-ocampo', q7: 'dindo-salazar', q8: 'isay-dimaculangan',
  q9: 'kaloy-mendoza', q10: 'ligaya-tan', q11: 'ramon-estrella', q12: 'nanding-aguilar',
};

/** Which star a news story is about (drives the news hero image and a link to the profile). */
export const newsActor: Record<string, string> = {
  n1: 'amihan-reyes', n2: 'manny-dalisay', n3: 'charing-villanueva', n4: 'bibi-manalo',
  n5: 'isay-dimaculangan', n6: 'kaloy-mendoza',
};
