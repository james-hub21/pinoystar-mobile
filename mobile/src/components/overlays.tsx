import { CircleAlert, Check, X } from 'lucide-react-native';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow, space, type } from '@/lib/theme';
import { Button, IconButton } from './ui';

// ── Toast ──────────────────────────────────────────────────────────────────
type Tone = 'success' | 'error';
const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; tone: Tone; key: number } | null>(null);
  const [anim] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, tone: Tone = 'success') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, tone, key: Date.now() });
      Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToast(null));
      }, 2600);
    },
    [anim],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const Icon = toast?.tone === 'error' ? CircleAlert : Check;
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            styles.toast,
            { top: insets.top + space.md, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] },
          ]}>
          <View style={[styles.toastIcon, { backgroundColor: toast.tone === 'error' ? colors.pinoyRed : colors.gold }]}>
            <Icon size={14} color={colors.white} strokeWidth={3} />
          </View>
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ── Confirmation dialog ───────────────────────────────────────────────────
export function ConfirmDialog({
  visible, title, body, confirmLabel, onConfirm, onCancel, loading, destructive,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.dialogBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onCancel} accessibilityLabel="Cancel" />
        <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert">
          <Text style={[type.h2, { fontSize: 20 }]}>{title}</Text>
          <Text style={[type.body, { marginTop: space.sm }]}>{body}</Text>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xxl }}>
            <Button label="Cancel" variant="secondary" onPress={onCancel} disabled={loading} style={{ flex: 1 }} />
            <Button label={confirmLabel} variant={destructive ? 'danger' : 'primary'} onPress={onConfirm} loading={loading} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Bottom sheet ──────────────────────────────────────────────────────────
export function Sheet({
  visible, title, onClose, children, footer,
}: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} accessibilityLabel={`Close ${title}`} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]} accessibilityViewIsModal>
          <View style={styles.grabber} />
          <View style={styles.sheetHeader}>
            <Text style={[type.h2, { fontSize: 20 }]} accessibilityRole="header">
              {title}
            </Text>
            <IconButton icon={X} label={`Close ${title}`} onPress={onClose} size={36} filled color={colors.maroonDeep} />
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.lg }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={{ paddingHorizontal: space.xl, paddingTop: space.sm }}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: 400,
    marginHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: space.md,
    paddingLeft: space.md,
    paddingRight: space.xl,
    zIndex: 100,
    ...shadow.lift,
  },
  toastIcon: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  toastText: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.cream, flexShrink: 1 },
  dialogBackdrop: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'center', padding: space.xxl },
  dialog: { backgroundColor: colors.cream, borderRadius: radius.xxxl, padding: space.xxl, maxWidth: 420, width: '100%', alignSelf: 'center', ...shadow.lift },
  sheetBackdrop: { flex: 1, backgroundColor: colors.scrim },
  sheet: { backgroundColor: colors.cream, borderTopLeftRadius: radius.xxxl, borderTopRightRadius: radius.xxxl, maxHeight: '85%' },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.cream300, marginTop: 10 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xl, paddingVertical: space.md },
});
