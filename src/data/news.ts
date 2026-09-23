import type { NewsItem } from '../types';
import { PHOTOS } from './actors';

export const news: NewsItem[] = [
{
  id: 'n1',
  headline: 'Amihan Reyes takes home her fourth Best Actress trophy',
  excerpt:
  'The "Salamin" star swept the acting field at last night\'s Gawad Sining, dedicating the win to her late acting coach in Iloilo.',
  source: 'Showbiz Weekly',
  minutesRead: 4,
  publishedAgo: '2h ago',
  image: PHOTOS.redCarpet,
  tag: 'Awards'
},
{
  id: 'n2',
  headline: '"Kalye Kings" renewed for a second season',
  excerpt: 'Production moves to Cebu in January with Manny Dalisay and Rafa Ocampo both returning.',
  source: 'Kapuso Insider',
  minutesRead: 3,
  publishedAgo: '6h ago',
  image: PHOTOS.filmSet,
  tag: 'Teleserye'
},
{
  id: 'n3',
  headline: 'Tita Charing named National Artist nominee for Film',
  excerpt: 'Forty-six years and one hundred and twelve credits later, the industry matriarch gets her due.',
  source: 'Sine Manila',
  minutesRead: 6,
  publishedAgo: 'Yesterday',
  image: PHOTOS.charing,
  tag: 'Legends'
},
{
  id: 'n4',
  headline: 'Bibi Manalo signs a two-picture deal with Habagat Pictures',
  excerpt: 'The Gen Z breakout will lead a coming-of-age drama shot entirely in Davao next summer.',
  source: 'Showbiz Weekly',
  minutesRead: 3,
  publishedAgo: 'Yesterday',
  image: PHOTOS.bibi,
  tag: 'New Gen'
}];