import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Compass, Heart, House, Search, User, type LucideIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '@/lib/theme';

const ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  index: { icon: House, label: 'Home' },
  search: { icon: Search, label: 'Search' },
  discover: { icon: Compass, label: 'Discover' },
  favorites: { icon: Heart, label: 'Favorites' },
  profile: { icon: User, label: 'Profile' },
};

/** The prototype's maroon bottom nav, including the sliding active pill. */
export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const routes = state.routes.filter((r) => ICONS[r.name]);
  const activeIndex = Math.max(0, routes.findIndex((r) => r.key === state.routes[state.index]?.key));
  // Animate the tab *index*, then scale by the measured width. Re-measuring never restarts
  // the spring, which could leave the pill stranded between tabs.
  const [index] = useState(() => new Animated.Value(activeIndex));
  const itemWidth = routes.length ? width / routes.length : 0;

  useEffect(() => {
    Animated.spring(index, {
      toValue: activeIndex,
      useNativeDriver: Platform.OS !== 'web',
      stiffness: 520,
      damping: 38,
      mass: 1,
    }).start();
  }, [activeIndex, index]);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      <View style={styles.row} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {itemWidth > 0 ? (
          <Animated.View style={[styles.pill, { width: itemWidth, transform: [{ translateX: Animated.multiply(index, itemWidth) }] }]} pointerEvents="none" />
        ) : null}
        {routes.map((route) => {
          const { icon: Icon, label } = ICONS[route.name];
          const focused = state.routes[state.index]?.key === route.key;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              aria-selected={focused}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={styles.item}>
              <Icon size={22} color={focused ? colors.goldLight : colors.cream400} strokeWidth={focused ? 2.4 : 1.9} />
              <Text style={[styles.label, { color: focused ? colors.cream : colors.cream400 }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.maroonDeep,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(142, 28, 43, 0.4)',
    paddingHorizontal: space.sm,
    paddingTop: space.sm,
  },
  row: { flexDirection: 'row' },
  pill: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: colors.maroon, borderRadius: radius.xl },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 7, minHeight: 52 },
  label: { fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 0.3 },
});
