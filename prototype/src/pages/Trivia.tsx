import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, FlameIcon, RotateCcwIcon, TrophyIcon, XIcon } from 'lucide-react';
import { triviaQuestions } from '../data/trivia';

const EASE = [0.23, 1, 0.32, 1] as const;

export function Trivia() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = triviaQuestions[index];
  const answered = picked !== null;
  const correct = answered && picked === question.answerIndex;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === question.answerIndex) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBest((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (index + 1 >= triviaQuestions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setStreak(0);
    setFinished(false);
  };

  return (
    <div className="min-h-screen bg-maroon-deep pb-8">
      <header className="px-5 pt-12">
        <h1 className="font-display text-[24px] font-black tracking-tight text-cream">
          Guess the Actor
        </h1>
        <div className="mt-4 flex gap-2.5">
          <div className="flex-1 rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream-400">Score</p>
            <p className="mt-0.5 font-display text-[22px] font-black leading-none text-cream">
              {score}
              <span className="text-[13px] font-bold text-cream-400"> / {triviaQuestions.length}</span>
            </p>
          </div>
          <div className="flex-1 rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream-400">Streak</p>
            <p className="mt-0.5 flex items-center gap-1 font-display text-[22px] font-black leading-none text-cream">
              <FlameIcon
                className={`h-5 w-5 ${streak > 1 ? 'fill-pinoy-yellow text-pinoy-yellow' : 'text-cream-400'}`}
                aria-hidden="true" />
              
              {streak}
            </p>
          </div>
        </div>
      </header>

      {finished ?
      <section className="mx-5 mt-8 rounded-4xl bg-cream px-6 py-10 text-center shadow-lift">
          <TrophyIcon className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
          <h2 className="mt-4 font-display text-[26px] font-black leading-tight text-ink">
            {score === triviaQuestions.length ? 'Perfect round!' : 'Round complete'}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-maroon-deep/70">
            You named {score} of {triviaQuestions.length} stars, with a best streak of {best}.
          </p>
          <button
          type="button"
          onClick={restart}
          className="mx-auto mt-6 flex items-center gap-2 rounded-full bg-maroon px-6 py-3 font-display text-[14.5px] font-bold text-cream outline-none transition-colors duration-150 ease-smooth hover:bg-maroon-light focus-visible:ring-2 focus-visible:ring-gold">
          
            <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
            Play again
          </button>
        </section> :

      <section className="mt-6 px-5">
          <div className="overflow-hidden rounded-4xl bg-cream shadow-lift">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-maroon">
              <img
              src={question.photo}
              alt=""
              className={`h-full w-full object-cover object-top transition-[filter,transform] duration-300 ease-smooth ${
              answered ? 'blur-0 scale-100' : 'blur-2xl scale-110'}`
              } />
            
              <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cream backdrop-blur-sm">
                Round {index + 1} of {triviaQuestions.length}
              </span>
            </div>

            <div className="p-5">
              <h2 className="font-display text-[18px] font-extrabold leading-snug text-ink">
                {question.prompt}
              </h2>

              <ul className="mt-4 space-y-2.5">
                {question.choices.map((choice, i) => {
                const isAnswer = i === question.answerIndex;
                const isPicked = i === picked;
                let tone = 'bg-white text-ink hover:bg-cream-200';
                if (answered && isAnswer) tone = 'bg-maroon text-cream';else
                if (answered && isPicked) tone = 'bg-pinoy-red/15 text-maroon-deep';else
                if (answered) tone = 'bg-white/60 text-maroon-deep/50';
                return (
                  <li key={choice}>
                      <button
                      type="button"
                      onClick={() => choose(i)}
                      disabled={answered}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left font-display text-[14.5px] font-bold shadow-card outline-none transition-colors duration-150 ease-smooth focus-visible:ring-2 focus-visible:ring-maroon ${tone}`}>
                      
                        {choice}
                        {answered && isAnswer && <CheckIcon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />}
                        {answered && isPicked && !isAnswer &&
                      <XIcon className="h-[18px] w-[18px] shrink-0 text-pinoy-red" aria-hidden="true" />
                      }
                      </button>
                    </li>);

              })}
              </ul>

              <AnimatePresence>
                {answered &&
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="mt-4">
                
                    <p
                  className={`font-display text-[15px] font-extrabold ${
                  correct ? 'text-maroon' : 'text-pinoy-red'}`
                  }>
                  
                      {correct ? 'Tama! Nailed it.' : 'Mali — better luck next round.'}
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-maroon-deep/70">{question.fact}</p>
                    <button
                  type="button"
                  onClick={next}
                  className="mt-4 w-full rounded-2xl bg-maroon py-3.5 font-display text-[14.5px] font-bold text-cream outline-none transition-colors duration-150 ease-smooth hover:bg-maroon-light focus-visible:ring-2 focus-visible:ring-gold">
                  
                      {index + 1 >= triviaQuestions.length ? 'See results' : 'Next round'}
                    </button>
                  </motion.div>
              }
              </AnimatePresence>
            </div>
          </div>
        </section>
      }
    </div>);

}