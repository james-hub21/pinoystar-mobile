import type { TriviaQuestion } from '../types';
import { PHOTOS } from './actors';

export const triviaQuestions: TriviaQuestion[] = [
{
  id: 'q1',
  prompt: 'Four Best Actress trophies and counting. Who is she?',
  photo: PHOTOS.amihan,
  choices: ['Amihan Reyes', 'Liwayway Santillan', 'Bianca Manalo', 'Rosario Villanueva'],
  answerIndex: 0,
  fact: 'Amihan was discovered at sixteen in an Iloilo mall talent search.'
},
{
  id: 'q2',
  prompt: 'This Kapuso lead began in fantaseryes. Name her.',
  photo: PHOTOS.liway,
  choices: ['Bianca Manalo', 'Liwayway Santillan', 'Amihan Reyes', 'Rosario Villanueva'],
  answerIndex: 1,
  fact: '"Gabi ng Liwanag" gave GMA its highest-rated finale in six years.'
},
{
  id: 'q3',
  prompt: 'Former stuntman, now an indie-film favorite. Who?',
  photo: PHOTOS.manny,
  choices: ['Rafael Ocampo', 'Fernando Aguilar', 'Emmanuel Dalisay', 'Nico Bautista'],
  answerIndex: 2,
  fact: 'Manny still performs most of his own falls.'
},
{
  id: 'q4',
  prompt: 'Forty-six years on screen without a single gap year.',
  photo: PHOTOS.charing,
  choices: ['Amihan Reyes', 'Pilar Domingo', 'Liwayway Santillan', 'Rosario Villanueva'],
  answerIndex: 3,
  fact: 'Tita Charing was nominated as National Artist for Film in 2024.'
},
{
  id: 'q5',
  prompt: 'A Davao bedroom monologue made this star famous. Who?',
  photo: PHOTOS.bibi,
  choices: ['Bianca Manalo', 'Amihan Reyes', 'Liwayway Santillan', 'Yumi Cruz'],
  answerIndex: 0,
  fact: 'Bibi is the youngest actress ever shortlisted for a Gawad Urian acting nod.'
},
{
  id: 'q6',
  prompt: 'Baguio swimmer turned Sparkle leading man.',
  photo: PHOTOS.rafa,
  choices: ['Emmanuel Dalisay', 'Rafael Ocampo', 'Fernando Aguilar', 'Migs Reyes'],
  answerIndex: 1,
  fact: 'A shampoo commercial ended Rafa\'s competitive swimming career.'
}];