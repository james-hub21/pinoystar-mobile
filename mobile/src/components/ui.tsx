import { Image } from 'expo-image';
import { ChevronRight, CircleAlert, type LucideIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View,
  type PressableProps, type StyleProp, type ViewStyle,
} from 'react-native';
import { colors, fonts, hitSlop, radius, shadow, space, type } from '@/lib/theme';

/** Pressable with the prototype's press feedback (scale .97 + slight dim). */
export function Press({ style, children, ...props }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      hitSlop={hitSlop}
      {...props}
      style={({ pressed }) => [style, pressed && !props.disabled && { transform: [{ scale: 0.97 }], opacity: 0.9 }]}>
      {children}
    </Pressable>
  );
}

export function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={type.h2} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction ? (
        <Press onPress={onAction} accessibilityRole="button" style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <ChevronRight size={16} color={colors.maroon} />
        </Press>
      ) : null}
    </View>
  );
}

export function Chip({
  label, selected, onPress, tone = 'light',
}: { label: string; selected?: boolean; onPress?: () => void; tone?: 'light' | 'dark' }) {
  const bg = selected ? colors.maroon : tone === 'dark' ? colors.whiteGlass : colors.cream200;
  const fg = selected ? colors.cream : tone === 'dark' ? colors.cream200 : colors.maroonDeep;
  return (
    <Press
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      aria-pressed={onPress ? !!selected : undefined}
      style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </Press>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'light';

export function Button({
  label, onPress, variant = 'primary', loading, disabled, icon: Icon, style,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
}) {
  const palette: Record<ButtonVariant, { bg: string; fg: string }> = {
    primary: { bg: colors.maroon, fg: colors.cream },
    secondary: { bg: colors.cream200, fg: colors.maroonDeep },
    danger: { bg: colors.pinoyRed, fg: colors.white },
    light: { bg: colors.cream, fg: colors.maroonDeep },
  };
  const { bg, fg } = palette[variant];
  const off = disabled || loading;
  return (
    <Press
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      style={[styles.button, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, style]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {Icon ? <Icon size={18} color={fg} strokeWidth={2.2} /> : null}
          <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
        </>
      )}
    </Press>
  );
}

/** Round translucent button used over photos and on the maroon headers. */
export function IconButton({
  icon: Icon, label, onPress, size = 40, filled, color = colors.cream, fill,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  size?: number;
  filled?: boolean;
  color?: string;
  fill?: string;
}) {
  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.iconButton, { width: size, height: size, backgroundColor: filled ? colors.cream200 : 'rgba(43,7,14,0.55)' }]}>
      <Icon size={size * 0.45} color={color} fill={fill ?? 'transparent'} strokeWidth={2} />
    </Press>
  );
}

export function Rail({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[{ paddingHorizontal: space.xl, gap: space.md, paddingBottom: space.xs }, style]}>
      {children}
    </ScrollView>
  );
}

/** Maroon rounded-bottom header shared by every tab (prototype's `rounded-b-3xl bg-maroon-deep`). */
export function Header({ title, subtitle, children, top }: { title?: string; subtitle?: string; children?: React.ReactNode; top: number }) {
  return (
    <View style={[styles.header, { paddingTop: top + space.lg }]}>
      {title ? <Text style={styles.headerTitle} accessibilityRole="header">{title}</Text> : null}
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function EmptyState({
  icon: Icon, title, body, cta, onCta,
}: { icon: LucideIcon; title: string; body: string; cta?: string; onCta?: () => void }) {
  return (
    <View style={styles.empty}>
      <Icon size={36} color={colors.cream400} />
      <Text style={[type.h2, { fontSize: 17, marginTop: space.md, textAlign: 'center' }]}>{title}</Text>
      <Text style={[type.body, { textAlign: 'center', marginTop: 6 }]}>{body}</Text>
      {cta && onCta ? <Button label={cta} onPress={onCta} style={{ marginTop: space.xl, alignSelf: 'center', paddingHorizontal: 22 }} /> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry, dark }: { message: string; onRetry?: () => void; dark?: boolean }) {
  return (
    <View style={[styles.empty, dark && { backgroundColor: colors.whiteGlass }]} accessibilityRole="alert">
      <CircleAlert size={32} color={dark ? colors.goldLight : colors.pinoyRed} />
      <Text style={[type.h2, { fontSize: 17, marginTop: space.md, textAlign: 'center' }, dark && { color: colors.cream }]}>
        That didn’t load
      </Text>
      <Text style={[type.body, { textAlign: 'center', marginTop: 6 }, dark && { color: colors.cream300 }]}>{message}</Text>
      {onRetry ? <Button label="Try again" variant={dark ? 'light' : 'primary'} onPress={onRetry} style={{ marginTop: space.xl, alignSelf: 'center', paddingHorizontal: 22 }} /> : null}
    </View>
  );
}

/** Pulsing placeholder block that matches the shape of the content it stands in for. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const [pulse] = useState(() => new Animated.Value(0.55));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={[{ backgroundColor: colors.cream300, borderRadius: radius.xl, opacity: pulse }, style]} />;
}

/** Poster image, or a typographic stand-in when a user-added title has no poster yet. */
export function Poster({ uri, title, style }: { uri: string | null; title: string; style: StyleProp<ViewStyle> }) {
  if (uri) return <Image source={{ uri }} style={style as never} contentFit="cover" transition={150} accessibilityIgnoresInvertColors />;
  return (
    <View style={[style, { backgroundColor: colors.maroon, justifyContent: 'flex-end', padding: 5, overflow: 'hidden' }]}>
      <Text numberOfLines={3} style={{ fontFamily: fonts.displayBlack, fontSize: 9, lineHeight: 10, color: colors.goldLight, textTransform: 'uppercase' }}>
        {title}
      </Text>
    </View>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text style={styles.fieldError} accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    marginBottom: space.md,
  },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sectionActionText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.maroon },
  chip: { borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: 9, minHeight: 36, justifyContent: 'center' },
  chipText: { fontFamily: fonts.semibold, fontSize: 13 },
  button: {
    minHeight: 48,
    borderRadius: radius.xl,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  buttonText: { fontFamily: fonts.displayBold, fontSize: 14.5 },
  iconButton: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: colors.maroonDeep,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    paddingHorizontal: space.xl,
    paddingBottom: space.lg,
  },
  headerTitle: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.cream },
  headerSubtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.cream400, marginTop: 4 },
  card: { backgroundColor: colors.white, borderRadius: radius.xxl, ...shadow.card },
  empty: {
    marginHorizontal: space.xl,
    marginTop: space.xxl,
    backgroundColor: colors.white,
    borderRadius: radius.xxxl,
    paddingHorizontal: 28,
    paddingVertical: space.huge,
    alignItems: 'center',
    ...shadow.card,
  },
  fieldError: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.pinoyRed, marginTop: 6 },
});
