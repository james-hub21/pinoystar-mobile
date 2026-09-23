import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Check, ChevronLeft, Flame, RotateCcw, Trophy, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/overlays';
import { Button, ErrorState, IconButton, Press, Skeleton } from '@/components/ui';
import { getSession } from '@/lib/api';
import { answerTrivia, useSaveAttempt, useTrivia } from '@/lib/queries';
import { colors, fonts, radius, shadow, space } from '@/lib/theme';
import type { TriviaResult } from '@/lib/types';

export default function Trivia() {
  const insets = useSafeAreaInsets();
  const { data: questions, isPending, isError, error, refetch } = useTrivia();
  const save = useSaveAttempt();
  const toast = useToast();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<TriviaResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = questions?.length ?? 0;
  const q = questions?.[index];

  const choose = async (i: number) => {
    if (!q || picked !== null) return;
    setPicked(i);
    setChecking(true);
    try {
      const r = await answerTrivia(q.id, i); // checked server-side; answers never reach the app early
      setResult(r);
      if (r.correct) {
        setScore((s) => s + 1);
        setStreak((s) => {
          setBest((b) => Math.max(b, s + 1));
          return s + 1;
        });
      } else setStreak(0);
    } catch (e) {
      setPicked(null);
      toast((e as Error).message, 'error');
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    if (index + 1 >= total) {
      setFinished(true);
      if (getSession()) save.mutate({ score, total, bestStreak: best });
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setResult(null);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setResult(null);
    setScore(0);
    setStreak(0);
    setBest(0);
    setFinished(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.maroonDeep }} contentContainerStyle={{ paddingBottom: space.huge + insets.bottom }}>
      <View style={{ paddingTop: insets.top + space.sm, paddingHorizontal: space.xl }}>
        <IconButton icon={ChevronLeft} label="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <Text style={styles.title} accessibilityRole="header">
          Guess the Actor
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>
              {score}
              <Text style={styles.statTotal}> / {total || '–'}</Text>
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Streak</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Flame size={20} color={streak > 1 ? colors.pinoyYellow : colors.cream400} fill={streak > 1 ? colors.pinoyYellow : 'transparent'} />
              <Text style={styles.statValue}>{streak}</Text>
            </View>
          </View>
        </View>
      </View>

      {isPending ? (
        <Skeleton style={{ margin: space.xl, height: 520, borderRadius: radius.xxxl, backgroundColor: colors.whiteGlass }} />
      ) : isError ? (
        <ErrorState dark message={error.message} onRetry={refetch} />
      ) : finished ? (
        <View style={styles.done}>
          <Trophy size={48} color={colors.gold} />
          <Text style={styles.doneTitle}>{score === total ? 'Perfect round!' : 'Round complete'}</Text>
          <Text style={styles.doneBody}>
            You named {score} of {total} stars, with a best streak of {best}.
          </Text>
          <Text style={styles.doneNote}>{getSession() ? (save.isPending ? 'Saving your score…' : save.isError ? 'We couldn’t save this round.' : 'Score saved to your profile.') : 'Sign in to keep your trivia wins.'}</Text>
          <Button label="Play again" icon={RotateCcw} onPress={restart} style={{ marginTop: space.xl, alignSelf: 'center', paddingHorizontal: space.xxl }} />
        </View>
      ) : q ? (
        <View style={styles.card}>
          <View style={styles.photoWrap}>
            {q.photoUrl ? (
              // Blurred until answered, exactly like the prototype.
              <Image source={{ uri: q.photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" blurRadius={result ? 0 : 40} transition={300} />
            ) : null}
            <Text style={styles.round}>
              Round {index + 1} of {total}
            </Text>
          </View>
          <View style={{ padding: space.xl }}>
            <Text style={styles.prompt}>{q.prompt}</Text>
            <View style={{ gap: 10, marginTop: space.lg }}>
              {q.choices.map((choice, i) => {
                const isAnswer = result?.answerIndex === i;
                const isPicked = picked === i;
                const bg = result && isAnswer ? colors.maroon : result && isPicked ? 'rgba(206,17,38,0.15)' : colors.white;
                const fg = result && isAnswer ? colors.cream : result && !isPicked ? 'rgba(61,10,18,0.5)' : colors.ink;
                return (
                  <Press
                    key={choice}
                    onPress={() => choose(i)}
                    disabled={picked !== null}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: picked !== null, selected: isPicked }}
                    style={[styles.choice, { backgroundColor: bg }]}>
                    <Text style={[styles.choiceText, { color: fg }]}>{choice}</Text>
                    {checking && isPicked ? <ActivityIndicator size="small" color={colors.maroon} /> : null}
                    {result && isAnswer ? <Check size={18} color={colors.cream} /> : null}
                    {result && isPicked && !isAnswer ? <X size={18} color={colors.pinoyRed} /> : null}
                  </Press>
                );
              })}
            </View>
            {result ? (
              <View style={{ marginTop: space.lg }} accessibilityLiveRegion="polite">
                <Text style={[styles.verdict, { color: result.correct ? colors.maroon : colors.pinoyRed }]}>
                  {result.correct ? 'Tama! Nailed it.' : 'Mali — better luck next round.'}
                </Text>
                <Text style={styles.fact}>{result.fact}</Text>
                <Button label={index + 1 >= total ? 'See results' : 'Next round'} onPress={next} style={{ marginTop: space.lg }} />
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.cream, marginTop: space.md },
  stat: { flex: 1, backgroundColor: colors.whiteGlass, borderRadius: radius.xl, paddingHorizontal: space.lg, paddingVertical: space.md },
  statLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.cream400 },
  statValue: { fontFamily: fonts.displayBlack, fontSize: 22, color: colors.cream },
  statTotal: { fontFamily: fonts.bold, fontSize: 13, color: colors.cream400 },
  card: { margin: space.xl, backgroundColor: colors.cream, borderRadius: radius.xxxl, overflow: 'hidden', ...shadow.lift },
  photoWrap: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.maroon },
  round: { position: 'absolute', left: space.lg, top: space.lg, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.cream, backgroundColor: 'rgba(43,7,14,0.7)', borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: 6, overflow: 'hidden' },
  prompt: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: colors.ink },
  choice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, borderRadius: radius.xl, paddingHorizontal: space.lg, paddingVertical: 14, minHeight: 52, ...shadow.card },
  choiceText: { fontFamily: fonts.displayBold, fontSize: 14.5, flexShrink: 1 },
  verdict: { fontFamily: fonts.display, fontSize: 15 },
  fact: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21, color: colors.inkMuted, marginTop: 4 },
  done: { margin: space.xl, marginTop: space.xxxl, backgroundColor: colors.cream, borderRadius: radius.xxxl, paddingHorizontal: space.xxl, paddingVertical: 40, alignItems: 'center', ...shadow.lift },
  doneTitle: { fontFamily: fonts.displayBlack, fontSize: 26, color: colors.ink, marginTop: space.lg },
  doneBody: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.inkMuted, textAlign: 'center', marginTop: space.sm },
  doneNote: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.maroonSoft, marginTop: space.md },
});
