// Design tokens ported 1:1 from the prototype's tailwind.config.js, so the app keeps its look.
import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  ink: '#2B070E',
  maroonDeep: '#3D0A12',
  maroon: '#6B0F1A',
  maroonLight: '#8E1C2B',
  maroonSoft: '#A8404C',
  goldDeep: '#9C7A18',
  gold: '#C9A227',
  goldLight: '#E4C55F',
  goldPale: '#F4E5B6',
  cream: '#FCF7EE',
  cream200: '#F4EADA',
  cream300: '#E7D8BF',
  cream400: '#CFBB9C',
  white: '#FFFFFF',
  pinoyRed: '#CE1126',
  pinoyBlue: '#0038A8',
  pinoyYellow: '#FCD116',
  // Text on cream: ink for primary, these alphas for secondary (all ≥ 4.5:1 on cream).
  inkMuted: 'rgba(61, 10, 18, 0.72)',
  inkSubtle: 'rgba(61, 10, 18, 0.6)',
  overlay: 'rgba(43, 7, 14, 0.78)',
  scrim: 'rgba(43, 7, 14, 0.5)',
  whiteGlass: 'rgba(255, 255, 255, 0.10)',
  whiteGlassStrong: 'rgba(255, 255, 255, 0.18)',
} as const;

export const radius = { md: 12, xl2: 18, xl: 20, xxl: 26, xxxl: 32, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;

export const fonts = {
  display: 'Archivo_800ExtraBold',
  displayBlack: 'Archivo_900Black',
  displayBold: 'Archivo_700Bold',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** The prototype's `shadow-card` / `shadow-lift`, translated to native shadow props. */
export const shadow = {
  card: Platform.select<ViewStyle>({
    web: { boxShadow: '0 10px 30px -12px rgba(43, 7, 14, 0.35)' } as ViewStyle,
    default: {
      shadowColor: colors.ink,
      shadowOpacity: 0.16,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
  }),
  lift: Platform.select<ViewStyle>({
    web: { boxShadow: '0 18px 40px -16px rgba(43, 7, 14, 0.5)' } as ViewStyle,
    default: {
      shadowColor: colors.ink,
      shadowOpacity: 0.28,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
  }),
};

export const type = {
  h1: { fontFamily: fonts.displayBlack, fontSize: 30, lineHeight: 32, color: colors.ink },
  h2: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24, color: colors.ink },
  title: { fontFamily: fonts.displayBold, fontSize: 15, lineHeight: 20, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.inkMuted },
  small: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 17, color: colors.inkMuted },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.maroon,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.maroonSoft,
  },
} satisfies Record<string, TextStyle>;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };
